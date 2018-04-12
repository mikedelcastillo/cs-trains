SELECT
  order_number,
  station_id,
  line_id
FROM
  station_order
WHERE
  system_id = $1;
