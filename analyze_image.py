import cv2
import numpy as np

img = cv2.imread('assets/cuentas-bancarias-final.png')
h, w = img.shape[:2]

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mid_col = gray[:, w//2]

in_card = False
start = None
for i, val in enumerate(mid_col):
    if val > 210:
        if not in_card:
            start = i
            in_card = True
    else:
        if in_card:
            if i - start > 50:
                center = (start + i) // 2
                pct = (center / h) * 100
                print(f"Card: Y={center} ({pct:.2f}%) Height={i-start}px")
            in_card = False
if in_card and h - start > 50:
    center = (start + h) // 2
    pct = (center / h) * 100
    print(f"Card: Y={center} ({pct:.2f}%) Height={h-start}px")
