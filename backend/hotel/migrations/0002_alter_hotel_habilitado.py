# Generated by Django 4.2.5 on 2023-12-02 21:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hotel', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hotel',
            name='habilitado',
            field=models.BooleanField(default=True),
        ),
    ]
