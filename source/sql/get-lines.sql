SELECT
  line_id,
  line_name
FROM
  lines
WHERE
  system_id = $1;
