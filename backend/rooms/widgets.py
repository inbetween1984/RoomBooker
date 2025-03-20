from django import forms
from django.utils.safestring import mark_safe

class YandexMapWidget(forms.TextInput):
    def render(self, name, value, attrs=None, renderer=None):
        latitude = self.attrs.get('latitude', '55.751244') or '55.751244'
        longitude = self.attrs.get('longitude', '37.618423') or '37.618423'
        api_key = 'd66de9ad-6911-40df-93c7-903ac0a64a6c'
        map_id = f"map_{name}"


        html = f'''
                <input type="text" name="{name}" id="id_{name}" value="{value or ''}" class="vTextField">
                <div id="{map_id}" style="width: 100%; height: 400px; margin-top: 10px;"></div>
                <input type="hidden" name="map_latitude" id="id_map_latitude" value="{latitude}">
                <input type="hidden" name="map_longitude" id="id_map_longitude" value="{longitude}">
                <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey={api_key}"></script>
                <style>
                    .ymaps-2-1-79-searchbox-input__input {{
                        color: #000000 !important; 
                    }}
                </style>
                <script>
                    ymaps.ready(function () {{
                        try {{
                            var map = new ymaps.Map("{map_id}", {{
                                center: [{latitude}, {longitude}],
                                zoom: 10
                            }});
                            var searchControl = new ymaps.control.SearchControl({{
                                options: {{ provider: 'yandex#search', noPlacemark: true }}
                            }});
                            map.controls.add(searchControl);

                            var placemark = null;
                            function updatePlacemark(coords) {{
                                if (placemark) {{
                                    map.geoObjects.remove(placemark);
                                }}
                                placemark = new ymaps.Placemark(coords, {{}}, {{
                                    preset: 'islands#redDotIcon',
                                    draggable: true
                                }});
                                placemark.events.add('dragend', function () {{
                                    var newCoords = placemark.geometry.getCoordinates();
                                    updateFields(newCoords);
                                }});
                                map.geoObjects.add(placemark);
                                updateFields(coords);
                            }}

                            function updateFields(coords) {{
                                document.getElementById('id_latitude').value = coords[0];
                                document.getElementById('id_longitude').value = coords[1];
                                document.getElementById('id_map_latitude').value = coords[0];
                                document.getElementById('id_map_longitude').value = coords[1];
                                ymaps.geocode(coords, {{ provider: 'yandex#map', results: 1 }}).then(function (res) {{
                                    var geoObject = res.geoObjects.get(0);
                                    if (geoObject) {{
                                        var address = geoObject.getAddressLine();
                                        document.getElementById('id_{name}').value = address;
                                    }}
                                }});
                            }}

                            if ("{latitude}" !== "55.751244" && "{longitude}" !== "37.618423") {{
                                updatePlacemark([{latitude}, {longitude}]);
                            }}

                            searchControl.events.add('resultselect', function (e) {{
                                var index = e.get('index');
                                searchControl.getResult(index).then(function (res) {{
                                    var coords = res.geometry.getCoordinates();
                                    map.setCenter(coords);
                                    updatePlacemark(coords);
                                }});
                            }});

                            map.events.add('click', function (e) {{
                                var coords = e.get('coords');
                                map.setCenter(coords);
                                updatePlacemark(coords);
                            }});

                            document.getElementById('id_{name}').addEventListener('change', function () {{
                                searchControl.search(this.value);
                            }});
                        }} catch (e) {{
                            console.error('Ошибка инициализации карты: ', e);
                        }}
                    }});
                </script>
                '''
        return mark_safe(html)