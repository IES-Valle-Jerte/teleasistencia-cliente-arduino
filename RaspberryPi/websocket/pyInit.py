import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)
print("  > GPIO 37 setup correctly")
GPIO.setup(37, GPIO.IN, pull_up_down=GPIO.PUD_UP)
print("  > GPIO 13 setup correctly")
GPIO.setup(13, GPIO.IN, pull_up_down=GPIO.PUD_UP)
