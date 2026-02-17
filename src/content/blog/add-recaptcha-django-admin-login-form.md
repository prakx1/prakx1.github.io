---
title: "Add reCAPTCHA to default Django admin login form"
description: "Add reCAPTCHA protection to Django admin login to reduce brute-force attempts."
date: 2021-10-06T20:41:00+07:00
categories:
  - python
  - django
  - security
tags:
  - django-admin
  - authentication
  - recaptcha
---

Before starting, install [`django-recaptcha`](https://pypi.org/project/django-recaptcha/) and
[create reCAPTCHA keys](https://www.google.com/recaptcha/about/).

```bash
pip install django-recaptcha
```

Add `'captcha'` to your `INSTALLED_APPS` setting.

```python
INSTALLED_APPS = [
    ...,
    'captcha',
    ...
]
```

Add the Google reCAPTCHA keys generated into your Django settings with `RECAPTCHA_PUBLIC_KEY` and `RECAPTCHA_PRIVATE_KEY`.

```python
RECAPTCHA_PUBLIC_KEY = 'MyRecaptchaKey123'
RECAPTCHA_PRIVATE_KEY = 'MyRecaptchaPrivateKey456'
```

Then extend the default authentication form and add a captcha field in `myapp/forms.py`:

```python
from django.conf import settings
from django.contrib.auth.forms import AuthenticationForm

from captcha.fields import ReCaptchaField
from captcha.widgets import ReCaptchaV2Checkbox


class AuthAdminForm(AuthenticationForm):

    if not settings.DEBUG:
        captcha = ReCaptchaField(widget=ReCaptchaV2Checkbox(
            attrs={
                'data-theme': 'light',
                'data-size': 'normal',
                # 'style': ('transform:scale(1.057);-webkit-transform:scale(1.057);'
                #           'transform-origin:0 0;-webkit-transform-origin:0 0;')
            }
        ))
```

Then in `myproject/urls.py`:

```python
from django.contrib import admin
from django.urls import include, path

from myapp.forms import AuthAdminForm

# Override the default admin login form
# and add reCAPTCHA to reduce brute-force attempts.
admin.autodiscover()
admin.site.login_form = AuthAdminForm
admin.site.login_template = 'account/admin/login.html'

urlpatterns = [
    path('admin/', admin.site.urls),
    ...
]
```

Finally, render the captcha field in `templates/account/admin/login.html`.
