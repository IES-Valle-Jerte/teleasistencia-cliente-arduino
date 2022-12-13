# teleasistencia-cliente-arduino

Proyecto en el que se incluye la documentación de Rasbperry y Arduino

Para comprobar el cliente es necesario utilizar un servidor Asterisk, en nuestro caso hemos optado por freePBX por las facilidades que ofrece. Para poder simular esta partes antes de integrarla en el proyecto de teleasistencia es necesario realizar los siguientes pasos:
1. **Arrancar el servidor freePBX** (hay una .ova en el drive). Obrenemos la IP del servidor
2. Utilizar **jssip - cliente** para comprobar que la comunicación tanto web por WebRTC como con SIP funciona correctamente (los datos de los usuarios están en la documentación interna)
3. Se ha facilitado un **vídeo con una demo** de cómo funcionaría (esta en el drive interno).

