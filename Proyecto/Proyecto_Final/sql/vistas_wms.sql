--
-- PostgreSQL database dump
--

\restrict u3seYKeWhrjmUukoTM3OywBdyf6sIzKUDl7tbb2xZOeWJXtlQjO3IyHxffsQQKj

-- Dumped from database version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: v_o3_promedio_2025; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_o3_promedio_2025 AS
 SELECT clave_estacion,
    nombre_estacion,
    municipio,
    round(avg(o3), 2) AS promedio_o3,
    count(o3) AS mediciones,
    geom
   FROM public.v_monitoreo_2025
  WHERE ((o3 IS NOT NULL) AND (geom IS NOT NULL))
  GROUP BY clave_estacion, nombre_estacion, municipio, geom;


ALTER VIEW public.v_o3_promedio_2025 OWNER TO postgres;

--
-- Name: v_pm25_promedio_2025; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.v_pm25_promedio_2025 AS
 SELECT clave_estacion,
    nombre_estacion,
    municipio,
    round(avg(pm25), 2) AS promedio_pm25,
    count(pm25) AS mediciones,
    geom
   FROM public.v_monitoreo_2025
  WHERE ((pm25 IS NOT NULL) AND (geom IS NOT NULL))
  GROUP BY clave_estacion, nombre_estacion, municipio, geom;


ALTER VIEW public.v_pm25_promedio_2025 OWNER TO postgres;

--
-- PostgreSQL database dump complete
--

\unrestrict u3seYKeWhrjmUukoTM3OywBdyf6sIzKUDl7tbb2xZOeWJXtlQjO3IyHxffsQQKj

