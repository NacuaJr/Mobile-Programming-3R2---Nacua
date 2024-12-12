import ujson
import usocket
from machine import Pin, SPI, UART
from mfrc522 import MFRC522
import network
import time

# Connect to Wi-Fi
ssid = "NacsFam"
password = "!admiNIStration24680"

sta_if = network.WLAN(network.STA_IF)
sta_if.active(True)
sta_if.connect(ssid, password)

# Wait for Wi-Fi connection
while not sta_if.isconnected():
    pass

# Set a static IP address
sta_if.ifconfig(('192.168.1.18', '255.255.255.0', '192.168.1.1', '8.8.8.8'))

print("Static IP set to:", sta_if.ifconfig()[0])

# UART configuration for GPS
GPS_TX = 17  # GPS TX pin (connected to ESP RX2)
GPS_RX = 16  # GPS RX pin (connected to ESP TX2)
gps_serial = UART(2, baudrate=9600, tx=GPS_TX, rx=GPS_RX)

def read_gps():
    """Read and process data from the GPS module."""
    try:
        if gps_serial.any():
            line = gps_serial.readline()  # Read a complete line from UART
            if line:
                try:
                    line = line.decode('utf-8')  # Decode as UTF-8
                    print(line.strip())  # Print raw NMEA sentence
                    if line.startswith('$GPGGA') or line.startswith('$GPRMC'):
                        print("Relevant GPS data:", line.strip())
                except UnicodeDecodeError:
                    print("GPS decoding error")
    except Exception as e:
        print("GPS read error:", e)

def read_rfid():
    # Initialize RFID reader
    sck = Pin(18, Pin.OUT)
    mosi = Pin(23, Pin.OUT)
    miso = Pin(19, Pin.IN)
    rst = Pin(5, Pin.OUT)
    cs = Pin(4, Pin.OUT)

    spi = SPI(baudrate=100000, polarity=0, phase=0, sck=sck, mosi=mosi, miso=miso)
    rdr = MFRC522(spi, cs, rst)

    print("Place RFID card...")

    while True:
        stat, tag_type = rdr.request(rdr.REQIDL)
        if stat == rdr.OK:
            stat, raw_uid = rdr.anticoll()
            if stat == rdr.OK:
                uid = ''.join(['{:02X}'.format(x) for x in raw_uid])
                print("RFID detected: UID=", uid)
                return uid

def handle_request(client, request):
    if '/trigger_rfid' in request:  # Endpoint to trigger RFID reading
        uid = read_rfid()
        if uid:
            response = ujson.dumps({"success": True, "uid": uid})
        else:
            response = ujson.dumps({"success": False})
    else:
        response = ujson.dumps({"error": "Invalid endpoint"})
    
    client.send('HTTP/1.0 200 OK\r\nContent-Type: application/json\r\n\r\n')
    client.send(response)
    client.close()

def start_server():
    addr = usocket.getaddrinfo('0.0.0.0', 80)[0][-1]
    server = usocket.socket()
    server.bind(addr)
    server.listen(5)
    print("Server started on", addr)

    server.setblocking(False)  # Non-blocking mode for the server
    return server

# Main loop
def main_loop():
    server = start_server()
    while True:
        try:
            # Handle GPS readings
            read_gps()

            # Check for incoming client connections
            try:
                client, addr = server.accept()
                print("Client connected from", addr)
                request = client.recv(1024).decode('utf-8')
                handle_request(client, request)
            except OSError:
                # No incoming connections
                pass

            # Small delay to allow cooperative multitasking
            time.sleep(0.1)

        except KeyboardInterrupt:
            print("Shutting down...")
            server.close()
            break

# Run the main loop
main_loop()
