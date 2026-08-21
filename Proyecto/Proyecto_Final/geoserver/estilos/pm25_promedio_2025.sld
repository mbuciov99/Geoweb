<?xml version="1.0" encoding="UTF-8"?>
<sld:StyledLayerDescriptor
    version="1.0.0"
    xmlns="http://www.opengis.net/sld"
    xmlns:sld="http://www.opengis.net/sld"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:gml="http://www.opengis.net/gml">

    <sld:NamedLayer>
        <sld:Name>pm25_promedio_2025</sld:Name>

        <sld:UserStyle>
            <sld:Title>Promedio de PM2.5 por estación, 2025</sld:Title>

            <sld:FeatureTypeStyle>

                <sld:Rule>
                    <sld:Title>Hasta 17 µg/m³</sld:Title>

                    <ogc:Filter>
                        <ogc:PropertyIsLessThanOrEqualTo>
                            <ogc:PropertyName>promedio_pm25</ogc:PropertyName>
                            <ogc:Literal>17</ogc:Literal>
                        </ogc:PropertyIsLessThanOrEqualTo>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>square</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">#457b9d</sld:CssParameter>
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

                <sld:Rule>
                    <sld:Title>Más de 17 a 21 µg/m³</sld:Title>

                    <ogc:Filter>
                        <ogc:And>
                            <ogc:PropertyIsGreaterThan>
                                <ogc:PropertyName>promedio_pm25</ogc:PropertyName>
                                <ogc:Literal>17</ogc:Literal>
                            </ogc:PropertyIsGreaterThan>

                            <ogc:PropertyIsLessThanOrEqualTo>
                                <ogc:PropertyName>promedio_pm25</ogc:PropertyName>
                                <ogc:Literal>21</ogc:Literal>
                            </ogc:PropertyIsLessThanOrEqualTo>
                        </ogc:And>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>square</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">#a8dadc</sld:CssParameter>
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

                <sld:Rule>
                    <sld:Title>Más de 21 a 23 µg/m³</sld:Title>

                    <ogc:Filter>
                        <ogc:And>
                            <ogc:PropertyIsGreaterThan>
                                <ogc:PropertyName>promedio_pm25</ogc:PropertyName>
                                <ogc:Literal>21</ogc:Literal>
                            </ogc:PropertyIsGreaterThan>

                            <ogc:PropertyIsLessThanOrEqualTo>
                                <ogc:PropertyName>promedio_pm25</ogc:PropertyName>
                                <ogc:Literal>23</ogc:Literal>
                            </ogc:PropertyIsLessThanOrEqualTo>
                        </ogc:And>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>square</sld:WellKnownName>
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

                <sld:Rule>
                    <sld:Title>Más de 23 µg/m³</sld:Title>

                    <ogc:Filter>
                        <ogc:PropertyIsGreaterThan>
                            <ogc:PropertyName>promedio_pm25</ogc:PropertyName>
                            <ogc:Literal>23</ogc:Literal>
                        </ogc:PropertyIsGreaterThan>
                    </ogc:Filter>

                    <sld:PointSymbolizer>
                        <sld:Graphic>
                            <sld:Mark>
                                <sld:WellKnownName>square</sld:WellKnownName>
                                <sld:Fill>
                                    <sld:CssParameter name="fill">#e63946</sld:CssParameter>
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