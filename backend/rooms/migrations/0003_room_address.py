# Generated by Django 5.1.3 on 2024-12-06 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0002_room_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='address',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
    ]
