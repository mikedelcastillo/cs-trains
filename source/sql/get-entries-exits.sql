SELECT * FROM entries_exits_condensed WHERE
  system_id = $1 AND
  unix_start >= $2 AND
  unix_end <= $3;
