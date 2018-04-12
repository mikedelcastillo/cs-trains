SELECT * FROM entries_exits WHERE
  system_id = $1 AND
  unix_start >= $2 AND
  unix_end <= $3;
