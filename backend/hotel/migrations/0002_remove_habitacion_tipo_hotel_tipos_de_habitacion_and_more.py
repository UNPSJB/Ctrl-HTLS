# Generated by Django 4.2.5 on 2023-10-16 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_tipohabitacion'),
        ('hotel', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='habitacion',
            name='tipo',
        ),
        migrations.AddField(
            model_name='hotel',
            name='tipos_de_habitacion',
            field=models.ManyToManyField(to='core.tipohabitacion'),
        ),
        migrations.DeleteModel(
            name='TipoHabitacion',
        ),
    ]
