import type { ClubFixture, ClubKey } from './types';

export const clubsFixture: Record<ClubKey, ClubFixture> = {
  boca: {
    name: 'Boca Juniors',
    shortName: 'BOCA',
    country: 'Argentina',
    league: 'Liga Profesional Argentina',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Boca_Juniors_logo18.svg/500px-Boca_Juniors_logo18.svg.png',
  },
  river: {
    name: 'Club Atlético River Plate',
    shortName: 'RIVER',
    country: 'Argentina',
    league: 'Liga Profesional Argentina',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Club_Atl%C3%A9tico_River_Plate_logo.svg/250px-Club_Atl%C3%A9tico_River_Plate_logo.svg.png',
  },
  barcelona: {
    name: 'FC Barcelona',
    shortName: 'FCB',
    country: 'Spain',
    league: 'La Liga',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/500px-FC_Barcelona_%28crest%29.svg.png',
  },
  realMadrid: {
    name: 'Real Madrid CF',
    shortName: 'RMA',
    country: 'Spain',
    league: 'La Liga',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/500px-Real_Madrid_CF.svg.png',
  },
};
