# Generated by Django 4.2.5 on 2023-11-05 19:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_categoria_estrellas'),
    ]

    operations = [
        migrations.AlterField(
            model_name='categoria',
            name='estrellas',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=2),
        ),
    ]
