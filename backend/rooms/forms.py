from django import forms
from .models import Room
from .widgets import YandexMapWidget

class RoomAdminForm(forms.ModelForm):
    latitude = forms.FloatField(required=False)
    longitude = forms.FloatField(required=False)

    class Meta:
        model = Room
        fields = '__all__'
        widgets = {
            'address': YandexMapWidget(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            self.fields['address'].widget.attrs.update({
                'latitude': self.instance.latitude,
                'longitude': self.instance.longitude,
            })
            self.initial['latitude'] = self.instance.latitude
            self.initial['longitude'] = self.instance.longitude


