# Generated by Django 5.1.3 on 2024-12-11 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='payment',
            name='transaction_id',
            field=models.CharField(blank=True, db_index=True, max_length=100, null=True),
        ),
    ]
