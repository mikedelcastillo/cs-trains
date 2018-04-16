SELECT
  systems.system_id,
  countries.country_id,
  countries.name AS country_name,
  cities.city_id,
  cities.name AS city_name,
  systems.name AS system_name,
  cities.utc_offset

  ,(SELECT
    MIN(e.unix_start)
  FROM entries_exits_condensed e
    WHERE systems.system_id = e.system_id) AS unix_start,
  (SELECT
    MAX(e.unix_end)
  FROM entries_exits_condensed e
    WHERE systems.system_id = e.system_id) AS unix_end

FROM systems
LEFT JOIN cities
  ON systems.city_id = cities.city_id
LEFT JOIN countries
  ON cities.country_id = countries.country_id
WHERE systems.system_id = $1;
