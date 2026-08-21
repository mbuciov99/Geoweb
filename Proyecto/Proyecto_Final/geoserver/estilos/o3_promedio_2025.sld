<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor
    version="1.0.0"
    xmlns="http://www.opengis.net/sld"
    xmlns:sld="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:gml="http://www.opengis.net/gml">

    <sld:NamedLayer>
        <sld:Name>o3_promedio_2025</sld:Name>

        <sld:UserStyle>
            <sld:Title>Promedio de ozono por estación, 2025</sld:Title>

            <sld:FeatureTypeStyle>

                <!-- Promedio menor o igual a 30 ppb -->
                <sld:Rule>
                    <sld:Title>Hasta 30 ppb</sld:Title>

                    <ogc:Filter>
                        <ogc:PropertyIsLessThanOrEqualTo>
                            <ogc:PropertyName>promedio_o3</ogc:PropertyName>
                            <ogc:Literal>30</ogc:Literal>
                        </ogc:PropertyIsLessThanOrEqualTo>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>circle</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">#2a9d8f</sld:CssParameter>
                                    <sld:CssParameter name="fill-opacity">0.9</sld:CssParameter>
                                </sld:Fill>
                                <sld:Stroke>
                                    <sld:CssParameter name="stroke">#ffffff</sld:CssParameter>
                                    <sld:CssParameter name="stroke-width">1.5</sld:CssParameter>
                                </sld:Stroke>
                            </sld:Mark>
                            <sld:Size>12</sld:Size>
                        </sld:Graphic>
                    </sld:PointSymbolizer>
                </sld:Rule>

                <!-- Promedio mayor a 30 y menor o igual a 33 ppb -->
                <sld:Rule>
                    <sld:Title>Más de 30 a 33 ppb</sld:Title>

                    <ogc:Filter>
                        <ogc:And>
                            <ogc:PropertyIsGreaterThan>
                                <ogc:PropertyName>promedio_o3</ogc:PropertyName>
                                <ogc:Literal>30</ogc:Literal>
                            </ogc:PropertyIsGreaterThan>

                            <ogc:PropertyIsLessThanOrEqualTo>
                                <ogc:PropertyName>promedio_o3</ogc:PropertyName>
                                <ogc:Literal>33</ogc:Literal>
                            </ogc:PropertyIsLessThanOrEqualTo>
                        </ogc:And>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>circle</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">#e9c46a</sld:CssParameter>
                                    <sld:CssParameter name="fill-opacity">0.9</sld:CssParameter>
                                </sld:Fill>
                                <sld:Stroke>
                                    <sld:CssParameter name="stroke">#ffffff</sld:CssParameter>
                                    <sld:CssParameter name="stroke-width">1.5</sld:CssParameter>
                                </sld:Stroke>
                            </sld:Mark>
                            <sld:Size>12</sld:Size>
                        </sld:Graphic>
                    </sld:PointSymbolizer>
                </sld:Rule>

                <!-- Promedio mayor a 33 y menor o igual a 36 ppb -->
                <sld:Rule>
                    <sld:Title>Más de 33 a 36 ppb</sld:Title>

                    <ogc:Filter>
                        <ogc:And>
                            <ogc:PropertyIsGreaterThan>
                                <ogc:PropertyName>promedio_o3</ogc:PropertyName>
                                <ogc:Literal>33</ogc:Literal>
                            </ogc:PropertyIsGreaterThan>

                            <ogc:PropertyIsLessThanOrEqualTo>
                                <ogc:PropertyName>promedio_o3</ogc:PropertyName>
                                <ogc:Literal>36</ogc:Literal>
                            </ogc:PropertyIsLessThanOrEqualTo>
                        </ogc:And>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>circle</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">#f4a261</sld:CssParameter>
                                    <sld:CssParameter name="fill-opacity">0.9</sld:CssParameter>
                                </sld:Fill>
                                <sld:Stroke>
                                    <sld:CssParameter name="stroke">#ffffff</sld:CssParameter>
                                    <sld:CssParameter name="stroke-width">1.5</sld:CssParameter>
                                </sld:Stroke>
                            </sld:Mark>
                            <sld:Size>12</sld:Size>
                        </sld:Graphic>
                    </sld:PointSymbolizer>
                </sld:Rule>

                <!-- Promedio mayor a 36 ppb -->
                <sld:Rule>
                    <sld:Title>Más de 36 ppb</sld:Title>

                    <ogc:Filter>
                        <ogc:PropertyIsGreaterThan>
                            <ogc:PropertyName>promedio_o3</ogc:PropertyName>
                            <ogc:Literal>36</ogc:Literal>
                        </ogc:PropertyIsGreaterThan>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>circle</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">#e76f51</sld:CssParameter>
                                    <sld:CssParameter name="fill-opacity">0.95</sld:CssParameter>
                                </sld:Fill>
                                <sld:Stroke>
                                    <sld:CssParameter name="stroke">#ffffff</sld:CssParameter>
                                    <sld:CssParameter name="stroke-width">1.5</sld:CssParameter>
                                </sld:Stroke>
                            </sld:Mark>
                            <sld:Size>12</sld:Size>
                        </sld:Graphic>
                    </sld:PointSymbolizer>
                </sld:Rule>

            </sld:FeatureTypeStyle>
        </sld:UserStyle>
    </sld:NamedLayer>
</sld:StyledLayerDescriptor>