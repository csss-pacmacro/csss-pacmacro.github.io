'''
from base64 import b64decode

import hashlib

from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad

def _unpad(s):
    return s[:-ord(s[len(s)-1:])]

def decrypt(key, enc):
    enc = b64decode(enc)
    iv = enc[:AES.block_size]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    return _unpad(cipher.decrypt(enc[AES.block_size:])).decode('utf-8')

key = hashlib.sha256("default".encode()).digest()
print("starting..")
print(decrypt(key, "U2FsdGVkX1/OlS2oCy6UCn+vqny2S7kkN11GiV+gEdI="))
print("done")
'''

'''
import binascii
from Crypto.Cipher import AES

KEY = 'This is a key123' # used to encrypt something
IV = 'This is an IV456' # ditto; send with key
MODE = AES.MODE_CFB
BLOCK_SIZE = 16
SEGMENT_SIZE = 128

def encrypt(key, iv, plaintext):
    aes = AES.new(key, MODE, iv, segment_size=SEGMENT_SIZE)
    plaintext = _pad_string(plaintext)
    encrypted_text = aes.encrypt(plaintext)
    return binascii.b2a_hex(encrypted_text).rstrip()

def decrypt(key, iv, encrypted_text):
    aes = AES.new(key, MODE, iv, segment_size=SEGMENT_SIZE)
    encrypted_text_bytes = binascii.a2b_hex(encrypted_text)
    decrypted_text = aes.decrypt(encrypted_text_bytes)
    decrypted_text = _unpad_string(decrypted_text)
    return decrypted_text

def _pad_string(value):
    length = len(value)
    pad_size = BLOCK_SIZE - (length % BLOCK_SIZE)
    return value.ljust(length + pad_size, '\x00')

def _unpad_string(value):
    while value[-1] == '\x00':
        value = value[:-1]
    return value

if __name__ == '__main__':
    input_plaintext = 'The answer is no'
    encrypted_text = encrypt(KEY, IV, input_plaintext)
    decrypted_text = decrypt(KEY, IV, encrypted_text)
    #assert decrypted_text == input_plaintext
    print(decrypted_text)
'''

import hashlib

from base64 import b64decode
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import algorithms
from Crypto.Cipher import AES
from binascii import b2a_hex, a2b_hex

# OKAY, NOW PLEASE MAKE IT WORK THANKS -> it yells because output is invalid (we expect this) -> key just needs to be some bytes as a bstr. We can get these via numbers or base64.

class AesCrypto(object):
    def __init__(self, key):
        tmpkey = hashlib.sha256("default".encode()).hexdigest()
        print(tmpkey)
        
        self.key = key.encode('utf-8')[:16];
        #self.key = b'This is a key123' #key.encode('utf-8')[:16]
        self.iv = self.keyccccccccccccccccccccccccccccccc

        #print(self.key)cccccccccccccccccccccccccccccccccccccccccccccccc
        #print(tmpkey)
        #print(len(self.key))
        #print(len(tmpkey))

        self.mode = AES.MODE_CBC

    @staticmethod
    def pkcs7_padding(data):
        if not isinstance(data, bytes):
            data = data.encode()
        padder = padding.PKCS7(algorithms.AES.block_size).padder()
        padded_data = padder.update(data) + padder.finalize()
        return padded_data

    def encrypt(self, plaintext):
        cryptor = AES.new(self.key, self.mode, self.iv)
        plaintext = plaintext
        plaintext = self.pkcs7_padding(plaintext)
        ciphertext = cryptor.encrypt(plaintext)
        return b2a_hex(ciphertext).decode('utf-8')

    def decrypt(self, ciphertext):
        cryptor = AES.new(self.key, self.mode, self.iv)
        plaintext = cryptor.decrypt(a2b_hex(ciphertext))
        print(plaintext)
        return bytes.decode(plaintext).rstrip('\0')


aes = AesCrypto('ddfbccae-b4c4-11')
#encrypted = aes.encrypt('The answer is no')
#print(encrypted)
decrypted = aes.decrypt(("0f218a8e74745c8747aa0b9029aa01a0"))
print(decrypted)

key = b'Sixteen byte key'
cipher = AES.new(key, AES.MODE_CBC, key)
