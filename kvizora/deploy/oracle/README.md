# Kvizora в интернете бесплатно: Oracle Cloud

Сервер Oracle «Always Free» бесплатен без срока. Kvizora работает на нём круглосуточно, данные (аккаунты, оценки, фото д/з)
хранятся на его диске и не стираются, каждую ночь делается резервная копия (хранится 30 дней).

## 1. Регистрация (один раз, ~15 минут)

1. Откройте https://signup.cloud.oracle.com и зарегистрируйтесь.
   Регион выберите в Европе, например **Germany Central (Frankfurt)**. Его потом не поменять.
   Карта нужна только для проверки: на бесплатных ресурсах деньги не списываются.
2. В консоли: **Compute → Instances → Create instance**.
   - Image: **Ubuntu 24.04**.
   - Shape: **Ampere (VM.Standard.A1.Flex)**, 1 OCPU и 6 GB хватит. Если пишет «Out of capacity», возьмите
     **VM.Standard.E2.1.Micro** (тоже бесплатный).
   - SSH keys: **Generate a key pair for me** → **Save private key** (сохраните файл, например `C:\Users\<вы>\kvizora.key`).
   - **Create**. Когда станет «Running», скопируйте **Public IP address**.
3. Откройте порты 80 и 443: на странице сервера нажмите ссылку подсети (**Subnet**) → **Security Lists** → **Default Security List**
   → **Add Ingress Rules**: Source CIDR `0.0.0.0/0`, IP Protocol TCP, Destination Port Range `80,443` → **Add**.

## 2. Установка (одна команда)

На Windows откройте «Командную строку» (cmd) и подключитесь к серверу (вместо `IP` — адрес из шага 2):

```
ssh -i C:\Users\<вы>\kvizora.key ubuntu@IP
```

На вопрос «Are you sure…» ответьте `yes`. Затем вставьте и нажмите Enter:

```
curl -fsSL https://raw.githubusercontent.com/voronoyitsmart-debug/Capain-/main/kvizora/deploy/oracle/install.sh | sudo bash
```

Через 3–5 минут скрипт напишет адрес сайта, вида `https://1-2-3-4.sslip.io`.

## 3. Первый вход

**Вариант А: перенести всё с ПК (C:\Kvizora)**. Аккаунты, тесты и оценки переедут как есть.
Остановите Kvizora на ПК, затем в cmd на ПК:

```
scp -i C:\Users\<вы>\kvizora.key C:\Kvizora\data\tests.db ubuntu@IP:/tmp/
scp -i C:\Users\<вы>\kvizora.key -r C:\Kvizora\data\hw-files ubuntu@IP:/tmp/
```

(вторая строка нужна, только если папка `hw-files` есть). Потом на сервере:

```
sudo systemctl stop kvizora
sudo mv /tmp/tests.db /var/lib/kvizora/ && sudo rm -f /var/lib/kvizora/tests.db-wal /var/lib/kvizora/tests.db-shm
[ -d /tmp/hw-files ] && sudo rm -rf /var/lib/kvizora/hw-files && sudo mv /tmp/hw-files /var/lib/kvizora/
sudo chown -R kvizora:kvizora /var/lib/kvizora && sudo systemctl start kvizora
```

**Вариант Б: начать с нуля.** Администратора создают только «с самого сервера». Подключитесь так:

```
ssh -i C:\Users\<вы>\kvizora.key -L 3000:localhost:3000 ubuntu@IP
```

и, пока окно открыто, откройте в браузере на ПК http://localhost:3000/setup.

После этого все входят по адресу `https://…sslip.io`.

## Как обновлять

Когда в GitHub появилась новая версия, подключитесь по ssh и запустите **ту же команду установки** ещё раз.
Данные в `/var/lib/kvizora` не трогаются.

## Полезное

| Что | Команда на сервере |
|---|---|
| Ключ Gemini, свой домен | `sudo nano /etc/kvizora.env`, затем `sudo systemctl restart kvizora` |
| Журнал работы | `sudo journalctl -u kvizora -f` |
| Перезапуск | `sudo systemctl restart kvizora` |
| Резервные копии | `/var/lib/kvizora/backups/` (скачать: `scp -i ключ ubuntu@IP:/var/lib/kvizora/backups/* .`) |
| Забыли пароль админа | `cd /opt/kvizora/kvizora && sudo -u kvizora DB_FILE=/var/lib/kvizora/tests.db node tools/reset-password.js e-mail` |

Свой домен: направьте его A-запись на IP сервера, впишите `DOMAIN=ваш.домен` в `/etc/kvizora.env`
и запустите команду установки ещё раз. HTTPS-сертификат выпустится сам.

Ключи и пароли храните только в `/etc/kvizora.env` на сервере, никогда не в GitHub.
