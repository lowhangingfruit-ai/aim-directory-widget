// CFA site map data.
//
// Marker coordinates are percentages of the base site-plan image and were
// extracted from AIM's Canva PDF ("CFA Site Map.pdf", 2 pages, one legend set
// per page) rather than placed by eye. Both PDF pages carry a byte-identical
// base image, so the two phases are two marker sets over one plan.
//
// The percentages are relative to the PDF *page*, which is why PLAN is cropped
// to the page frame rather than exported whole. See the note on PLAN below.
//
// If AIM sends a revised PDF, re-run scripts/extract-site-map.py and paste the
// output over the PHASES coordinates instead of nudging them by hand.
//
// Labels follow the PDF except where it disagrees with AIM's own published copy
// on agriculturalinstitute.org/cfa; those cases are marked and listed in the
// README section of scripts/extract-site-map.py.
//
// One house rule on top of that: AIM asked for "and" rather than "&" throughout,
// so the PDF's ampersands are spelled out here. Keep it that way.

export interface Feature {
  /** the letter or number shown in the circle, and the anchor id */
  key: string
  label: string
  /** every place this feature appears on the plan; several appear more than once */
  points: { x: number; y: number }[]
}

export interface Phase {
  id: 'one' | 'two'
  /** short label for the tab */
  tab: string
  /** full heading, matching the legend title in the PDF */
  title: string
  /** A-M for phase one, 1-14 for phase two */
  markerShape: 'letter' | 'number'
  /** the view the map opens on, as a fraction of the whole plan */
  initialView: { x: number; y: number; scale: number }
  features: Feature[]
}

export const PHASES: Phase[] = [
  {
    id: 'one',
    tab: 'Phase One',
    title: 'Phase One: Permanent Farmers Market',
    markerShape: 'letter',
    // the market pad and its edges: most of the plan is in play
    initialView: { x: 50, y: 62, scale: 1.35 },
    features: [
      {
        key: 'A',
        label: 'Permanent Shade Structures',
        points: [
          { x: 50.29, y: 65.64 },
          { x: 59.71, y: 49.58 },
          { x: 59.7, y: 65.37 },
        ],
      },
      { key: 'B', label: 'Market Vendor Tents', points: [{ x: 54.73, y: 70.01 }] },
      {
        key: 'C',
        label: 'Public Restrooms Building #1 and #2',
        points: [
          { x: 44.48, y: 81.83 },
          { x: 77.54, y: 48.75 },
        ],
      },
      {
        key: 'D',
        label: 'Hydration Stations',
        points: [
          { x: 44.5, y: 84.69 },
          { x: 77.56, y: 51.61 },
        ],
      },
      {
        key: 'E',
        label: 'Chef and Bulk Curbside Pickup',
        points: [
          { x: 79.6, y: 44.24 },
          { x: 71.64, y: 35.05 },
        ],
      },
      { key: 'F', label: 'Digital Kiosk #1', points: [{ x: 64.95, y: 30.87 }] },
      { key: 'G', label: 'EV Charging', points: [{ x: 43.37, y: 68.2 }] },
      {
        key: 'H',
        label: 'Cheryl and Sven Pole Bicycle Parking',
        points: [{ x: 39.86, y: 67.91 }],
      },
      { key: 'I', label: 'Cold Storage and Ice Storage', points: [{ x: 44.51, y: 87.99 }] },
      { key: 'J', label: 'Market Storage', points: [{ x: 46.07, y: 87.99 }] },
      { key: 'K', label: 'Recycling Center', points: [{ x: 47.56, y: 83.02 }] },
      {
        key: 'L',
        label: 'Cafe Seating',
        points: [
          { x: 66.65, y: 77.32 },
          { x: 42.73, y: 74.37 },
        ],
      },
      { key: 'M', label: 'SMART Train Station', points: [{ x: 4.39, y: 93.48 }] },
    ],
  },
  {
    id: 'two',
    tab: 'Phase Two',
    title: 'Phase Two: Food Innovation Hub',
    markerShape: 'number',
    // every phase two feature sits in the western third; opening on the whole
    // plan would show the hub at about a tenth of the frame. Held at 2.3 so the
    // opening view stays inside the plan's own resolution, see sharpScale in
    // CfaMapClient.
    initialView: { x: 29, y: 84, scale: 2.3 },
    features: [
      { key: '1', label: 'Visitor Center and Cafe', points: [{ x: 38.06, y: 74.83 }] },
      {
        key: '2',
        label: 'AIM Offices and Community Meeting Spaces',
        points: [
          { x: 33.64, y: 87.73 },
          { x: 38.3, y: 87.73 },
        ],
      },
      { key: '3', label: 'Entry Plaza', points: [{ x: 43.06, y: 77.47 }] },
      { key: '4', label: 'Gilardi Demonstration Kitchen', points: [{ x: 32.32, y: 84.18 }] },
      {
        key: '5',
        // PDF reads "CHILDRENS"; AIM's /cfa page uses the possessive
        label: "James P. Williams Children's Learning Garden",
        points: [{ x: 25.27, y: 87.46 }],
      },
      { key: '6', label: "Future Farmer's Area", points: [{ x: 22.68, y: 89.92 }] },
      {
        key: '7',
        // PDF reads "PAY LOONEY"; AIM's /cfa page names the donor Pat Looney
        label: 'Pat Looney Greenhouse',
        points: [{ x: 20.74, y: 87.19 }],
      },
      {
        key: '8',
        label: 'Kira and Bradley Haas Outdoor Classroom',
        points: [{ x: 27.3, y: 86.0 }],
      },
      { key: '9', label: 'Climate Resiliency Garden', points: [{ x: 29.8, y: 85.09 }] },
      { key: '10', label: 'Gathering Tree and Stage', points: [{ x: 41.94, y: 81.81 }] },
      {
        key: '11',
        // PDF runs these together with no conjunction
        label: 'Public Restrooms Building #3 and Hydration Station',
        points: [{ x: 34.53, y: 77.2 }],
      },
      { key: '12', label: 'Digital Kiosk #2', points: [{ x: 40.62, y: 74.83 }] },
      { key: '13', label: 'Wind Break Hedgerow', points: [{ x: 36.26, y: 90.84 }] },
      { key: '14', label: 'Riparian Area', points: [{ x: 13.06, y: 89.28 }] },
    ],
  },
]

/**
 * The base plan, shared by both phases. Cropped to the PDF page frame: Canva
 * places the art larger than the page and it overhangs the trim, so the full
 * export would put every marker off by the overhang.
 */
export const PLAN = {
  src: '/cfa/site-plan.webp',
  placeholder: '/cfa/site-plan-1600.webp',
  width: 3486,
  height: 1961,
}
