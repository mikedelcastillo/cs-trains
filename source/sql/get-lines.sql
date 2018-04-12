SELECT
  line_id,
  line_name,
  line_color
FROM
  lines
WHERE
  system_id = $1;
