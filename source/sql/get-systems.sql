SELECT
  systems.system_id,
  countries.country_id,
  countries.name AS country_name,
  cities.city_id,
  cities.name AS city_name,
  systems.name AS system_name
FROM systems
LEFT JOIN cities
  ON systems.city_id = cities.city_id
LEFT JOIN countries
  ON cities.country_id = countries.country_id;
