'use server'

import { revalidatePath } from 'next/cache'
import payload from 'payload'
import { format, addHours, isBefore, isAfter, parseISO, startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import type { Config } from '@/payload/payload-types'

type ScheduleFormData = {
	fullName: string
	email: string
	phoneNumber: string
	callDate: Date
	timeSlot: string
	callType: string
}

type TimeSlot = {
	startTime: string
	duration: string
	maxBookings: number
}

type AvailabilitySettings = {
	timezone: string
	weeklySchedule: Array<{
		dayOfWeek: string
		isAvailable: boolean
		timeSlots: TimeSlot[]
	}>
	specialDates: Array<{
		date: string
		isUnavailable: boolean
		note?: string
		timeSlots?: TimeSlot[]
	}>
	advanceBookingDays: number
	minimumNotice: number
}

type ScheduledCallType = {
	id: string
	fullName: string
	email: string
	phoneNumber: string
	callDate: string
	timeSlot: string
	callType: string
	status: string
	createdAt: string
	updatedAt: string
}

export type AvailabilityResponse = {
	success: boolean
	availableSlots: Array<{ time: string; duration: string }>
	bookedSlots: string[]
	message?: string | null
	error?: string
}

// Check availability for a specific date
export async function checkAvailability(date: Date): Promise<AvailabilityResponse> {
	try {
		// Get company availability settings
		const availabilitySettings = await payload.findGlobal({
			slug: 'availability',
		})

		if (!availabilitySettings) {
			throw new Error('Availability settings not found')
		}

		const {
			timezone = 'America/New_York',
			weeklySchedule = [],
			specialDates = [],
			advanceBookingDays = 14,
			minimumNotice = 1,
		} = availabilitySettings

		// Convert date to company's timezone
		const zonedDate = toZonedTime(date, timezone)
		const formattedDate = format(zonedDate, 'yyyy-MM-dd')
		const dayOfWeek = format(zonedDate, 'i') // 1-7, Monday is 1

		// Check if date is within advance booking window
		const maxDate = addHours(new Date(), advanceBookingDays * 24)
		if (isAfter(zonedDate, maxDate)) {
			return {
				success: false,
				error: `Bookings can only be made up to ${advanceBookingDays} days in advance.`,
				availableSlots: [],
				bookedSlots: [],
			}
		}

		// Check minimum notice period
		const minDate = addHours(new Date(), minimumNotice)
		if (isBefore(zonedDate, minDate)) {
			return {
				success: false,
				error: `Bookings require ${minimumNotice} hours notice.`,
				availableSlots: [],
				bookedSlots: [],
			}
		}

		// Check for special date override
		const specialDate = specialDates.find(
			(special) => format(parseISO(special.date), 'yyyy-MM-dd') === formattedDate,
		)

		if (specialDate?.isUnavailable) {
			return {
				success: true,
				availableSlots: [],
				bookedSlots: [], // Return empty array to indicate no slots available
				message: specialDate.note || 'This date is unavailable for bookings.',
			}
		}

		// Get available time slots
		let availableSlots: TimeSlot[] = []
		if (specialDate?.timeSlots) {
			// Use special date slots if available
			availableSlots = specialDate.timeSlots
		} else {
			// Use regular weekly schedule
			const daySchedule = weeklySchedule.find((schedule) => schedule.dayOfWeek === dayOfWeek)
			if (!daySchedule?.isAvailable) {
				return {
					success: true,
					availableSlots: [],
					bookedSlots: [], // Return empty array to indicate no slots available
					message: 'No appointments available on this day.',
				}
			}
			availableSlots = daySchedule.timeSlots || []
		}

		// Get existing bookings for this date
		const scheduledCalls = await payload.find({
			collection: 'scheduled-calls',
			where: {
				and: [
					{
						callDate: {
							equals: formattedDate,
						},
					},
					{
						status: {
							not_equals: 'cancelled',
						},
					},
				],
			},
		})

		// Count bookings per time slot
		const bookingCounts: Record<string, number> = {}
		scheduledCalls.docs.forEach((call) => {
			bookingCounts[call.timeSlot] = (bookingCounts[call.timeSlot] || 0) + 1
		})

		// Filter out fully booked slots and format remaining slots
		const bookedSlots = availableSlots
			.filter((slot) => {
				const bookingCount = bookingCounts[slot.startTime] || 0
				return bookingCount >= slot.maxBookings
			})
			.map((slot) => slot.startTime)

		return {
			success: true,
			availableSlots: availableSlots
				.filter((slot) => {
					const bookingCount = bookingCounts[slot.startTime] || 0
					return bookingCount < slot.maxBookings
				})
				.map((slot) => ({
					time: slot.startTime,
					duration: slot.duration,
				})),
			bookedSlots,
			message: null,
		}
	} catch (error) {
		console.error('Error checking availability:', error)
		return {
			success: false,
			error: 'Failed to check availability. Please try again.',
			availableSlots: [],
			bookedSlots: [],
		}
	}
}

// Schedule a call
export async function scheduleCall(data: ScheduleFormData) {
	try {
		// Get availability settings for validation
		const availabilitySettings = await payload.findGlobal({
			slug: 'availability',
		})

		if (!availabilitySettings) {
			throw new Error('Availability settings not found')
		}

		const { timezone = 'America/New_York' } = availabilitySettings

		// Convert and format date
		const zonedDate = toZonedTime(data.callDate, timezone)
		const formattedDate = format(zonedDate, 'yyyy-MM-dd')

		// Check if slot is still available
		const availabilityCheck = await checkAvailability(zonedDate)
		if (!availabilityCheck.success || availabilityCheck.bookedSlots?.includes(data.timeSlot)) {
			return {
				success: false,
				error: 'This time slot is no longer available. Please select another time.',
			}
		}

		// Create the scheduled call
		const scheduledCall = await payload.create({
			collection: 'scheduled-calls',
			data: {
				fullName: data.fullName,
				email: data.email,
				phoneNumber: data.phoneNumber,
				callDate: formattedDate,
				timeSlot: data.timeSlot,
				callType: data.callType,
				status: 'new',
			},
		})

		// Revalidate the contact page
		revalidatePath('/contact')

		return {
			success: true,
			data: scheduledCall,
		}
	} catch (error) {
		console.error('Error scheduling call:', error)
		return {
			success: false,
			error: 'Failed to schedule call. Please try again.',
		}
	}
}
