import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres';
import { resendAdapter } from '@payloadcms/email-resend';
import ShowcaseGlobal from '@/globals/Showcase/config';
import AboutGlobal from '@/globals/About/config';
import HomeGlobalConfig from '@/globals/HomeGlobal';

// Payload imports
import { PayloadRequest, buildConfig } from 'payload';
import sharp from 'sharp'; // editor-import
import { LegalDocs } from '@/collections/Legal-Docs';

import { defaultLexical } from '@/fields/defaultLexical';
import { Plugins } from '@/collections/Plugins';
import { Categories } from '@/collections/Categories';
import { Tags } from '@/collections/Tags';
import { Resources } from '@/collections/Resources';
import { SVGs } from '@/collections/SVGs';
import { Items } from '@/collections/Items';
import { Showcases } from '@/collections/Showcases';
// Globals
import Footer from '@/globals/Footer/config';
import Nav from '@/globals/Nav/config';
// Collections
import { Links } from '@/payload/collections/Links';
import { Media } from '@/payload/collections/Media';
import { Users } from '@/payload/collections/Users';
import { plugins } from '@/plugins';
import { getServerSideURL } from '@/utilities/getURL';
import ContactSubmissions from './collections/ContactSubmissions';
import PluginReports from './collections/PluginReports';

import ContactGlobal from './globals/Contact/config';
import updateGitHubDataHandler from './tasks/updateGitHubData';
import { updateGitHubDataEndpoint } from './endpoints/updateGitHubData';
import { updateReleasesDataEndpoint } from './endpoints/updateReleasesData';
import { Releases } from '@/collections/Releases/config';
import PluginsGlobal from './globals/Plugins/config';
import fetchPayloadReleasesHandler from './tasks/fetchPayloadReleases';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',

  i18n: {
    translations: {
      en: {
        general: {
          dashboard: 'Dashboard',
          save: 'Save',
          cancel: 'Cancel',
        },
      },
    },
  },
  // Admin panel configuration
  admin: {
    autoLogin:
      process.env.NODE_ENV === 'development'
        ? {
            email: 'admin@omnipixel.ai',
            password: 'sewroj-hupdur-5puzDe',
            prefillOnly: true,
          }
        : false,
    theme: 'dark',
    components: {
      providers: ['@/components/admin/CustomCSSProvider'],
      graphics: {
        Icon: '@/graphics/Icon',
        Logo: '@/components/LoginLogo',
      },
      beforeDashboard: ['@/components/BeforeDashboard'],
      beforeLogin: ['@/components/BeforeLogin'],
      afterLogin: ['@/components/AfterLogin'],
      /*afterNavLinks: [
        '@/components/AfterNavLinks/LinkToCustomView#LinkToCustomView',
        '@/components/AfterNavLinks/LinkToCustomMinimalView#LinkToCustomMinimalView',
        '@/components/AfterNavLinks/LinkToCustomDefaultView#LinkToCustomDefaultView',
      ],
      views: {
        CustomRootView: {
          Component: '@/components/Views/CustomRootView#CustomRootView',
          path: '/custom',
        },
        DefaultCustomView: {
          Component: '@/components/Views/CustomDefaultRootView#CustomDefaultRootView',
          path: '/custom-default',
        },
        MinimalCustomView: {
          Component: '@/components/Views/CustomMinimalRootView#CustomMinimalRootView',
          path: '/custom-minimal',
        },
      },*/
    },
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      url: process.env.NEXT_PUBLIC_SERVER_URL,
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
    meta: {
      title: 'Omnipixel',
      description: 'Manage the Omnipixel Website',
      icons: [{ url: '/favicon.ico' }],
      titleSuffix: ' - Omnipixel',
    },
  },

  // Database configuration

  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  editor: defaultLexical,
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  // Email configuration
  email: resendAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS,
    defaultFromName: process.env.EMAIL_FROM_NAME,
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  endpoints: [
    {
      path: '/update-github-data',
      method: 'post',
      handler: updateGitHubDataEndpoint,
    },
    {
      path: '/update-releases-data',
      method: 'post',
      handler: updateReleasesDataEndpoint,
    },
  ],

  // Define collections
  collections: [
    Users,
    Media,
    Links,
    LegalDocs,
    ContactSubmissions,
    PluginReports,
    SVGs,
    Items,
    Showcases,
    Categories,
    Tags,
    Plugins,
    Resources,
    Releases,
  ],

  // Define globals
  globals: [
    Nav,
    ContactGlobal,
    Footer,
    ShowcaseGlobal,
    AboutGlobal,
    HomeGlobalConfig,
    PluginsGlobal,
  ],

  // CORS configuration
  cors: [getServerSideURL()].filter(Boolean),
  csrf: [getServerSideURL()].filter(Boolean),

  // Plugins
  plugins,

  // Payload secret key
  secret: process.env.PAYLOAD_SECRET || '',

  // TypeScript configuration
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // Image processing
  sharp,
});
