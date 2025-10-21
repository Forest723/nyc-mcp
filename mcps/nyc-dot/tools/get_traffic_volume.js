import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/btm5-ppia.json';

export default async function getTrafficVolume(params) {
  const {
    boro,
    limit = 100
  } = params;

  const whereConditions = [];

  if (boro) {
    whereConditions.push(`boro='${boro.toUpperCase()}'`);
  }

  const query = {
    $limit: limit
  };

  if (whereConditions.length > 0) {
    query.$where = whereConditions.join(' AND ');
  }

  try {
    const headers = {};
    if (process.env.NYC_OPEN_DATA_APP_TOKEN) {
      headers['X-App-Token'] = process.env.NYC_OPEN_DATA_APP_TOKEN;
    }

    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers
    });

    return {
      success: true,
      count: response.data.length,
      traffic_data: response.data.map(t => ({
        id: t.id,
        segment_id: t.segmentid,
        roadway_name: t.roadway_name,
        from: t.from,
        to: t.to,
        direction: t.direction,
        date: t.date,
        // Include hourly volume data
        hourly_volumes: {
          '12am-1am': t._12_00_1_00_am,
          '1am-2am': t._1_00_2_00am,
          '2am-3am': t._2_00_3_00am,
          '3am-4am': t._3_00_4_00am,
          '4am-5am': t._4_00_5_00am,
          '5am-6am': t._5_00_6_00am,
          '6am-7am': t._6_00_7_00am,
          '7am-8am': t._7_00_8_00am,
          '8am-9am': t._8_00_9_00am,
          '9am-10am': t._9_00_10_00am,
          '10am-11am': t._10_00_11_00am,
          '11am-12pm': t._11_00_12_00pm,
          '12pm-1pm': t._12_00_1_00pm,
          '1pm-2pm': t._1_00_2_00pm,
          '2pm-3pm': t._2_00_3_00pm,
          '3pm-4pm': t._3_00_4_00pm,
          '4pm-5pm': t._4_00_5_00pm,
          '5pm-6pm': t._5_00_6_00pm,
          '6pm-7pm': t._6_00_7_00pm,
          '7pm-8pm': t._7_00_8_00pm,
          '8pm-9pm': t._8_00_9_00pm,
          '9pm-10pm': t._9_00_10_00pm,
          '10pm-11pm': t._10_00_11_00pm,
          '11pm-12am': t._11_00_12_00am
        }
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get traffic volume: ${error.message}`);
  }
}
