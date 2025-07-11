# Generated by Django 5.2.1 on 2025-07-02 06:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('polls', '0002_jibbersichstuffi_node_samplemodel'),
    ]

    operations = [
        migrations.CreateModel(
            name='InpFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fileName', models.CharField(max_length=200)),
            ],
        ),
        migrations.DeleteModel(
            name='JibbersiChstuffi',
        ),
        migrations.AddField(
            model_name='node',
            name='inpFile',
            field=models.ManyToManyField(to='polls.inpfile'),
        ),
        migrations.DeleteModel(
            name='SampleModel',
        ),
    ]
