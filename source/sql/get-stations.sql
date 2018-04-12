SELECT
  station_id,
  station_name
FROM
  stations
WHERE
  system_id = $1;
