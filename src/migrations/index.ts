import * as migration_20250321_195654 from './20250321_195654';
import * as migration_20250322_052927 from './20250322_052927';
import * as migration_20250322_070857 from './20250322_070857';
import * as migration_20250323_040045 from './20250323_040045';
import * as migration_20250325_053616 from './20250325_053616';
import * as migration_20250411_024800 from './20250411_024800';

export const migrations = [
  {
    up: migration_20250321_195654.up,
    down: migration_20250321_195654.down,
    name: '20250321_195654',
  },
  {
    up: migration_20250322_052927.up,
    down: migration_20250322_052927.down,
    name: '20250322_052927',
  },
  {
    up: migration_20250322_070857.up,
    down: migration_20250322_070857.down,
    name: '20250322_070857',
  },
  {
    up: migration_20250323_040045.up,
    down: migration_20250323_040045.down,
    name: '20250323_040045',
  },
  {
    up: migration_20250325_053616.up,
    down: migration_20250325_053616.down,
    name: '20250325_053616',
  },
  {
    up: migration_20250411_024800.up,
    down: migration_20250411_024800.down,
    name: '20250411_024800'
  },
];
