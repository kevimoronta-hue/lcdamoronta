import cv2
import numpy as np

img = cv2.imread('assets/cuentas-bancarias-final.png')
h, w = img.shape[:2]

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Filter by area to find cards
cards = []
for cnt in contours:
    x, y, w_cnt, h_cnt = cv2.boundingRect(cnt)
    if w_cnt > w * 0.5 and h_cnt > h * 0.05:
        cards.append({'y': y, 'h': h_cnt, 'center': y + h_cnt // 2})

cards.sort(key=lambda c: c['y'])

for i, card in enumerate(cards):
    pct = (card['center'] / h) * 100
    print(f"Card {i+1}: Y={card['center']} ({pct:.2f}%) Height={card['h']}px")
