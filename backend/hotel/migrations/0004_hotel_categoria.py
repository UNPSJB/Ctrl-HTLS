# Generated by Django 4.2.5 on 2023-10-20 19:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_persona_cliente_encargado_vendedor'),
        ('hotel', '0003_habitacion_tipo_habitacion'),
    ]

    operations = [
        migrations.AddField(
            model_name='hotel',
            name='categoria',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.categoria'),
        ),
    ]
