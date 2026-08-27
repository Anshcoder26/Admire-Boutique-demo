export function GlobalOrnaments() {
  return (
    <div aria-hidden="true" className="global-ornaments pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-100">
      <svg viewBox="0 0 340 420" className="absolute -left-8 top-24 h-72 w-72 md:h-[23rem] md:w-[23rem]">
        <path d="M68 330 C 102 272, 126 206, 126 146 C 101 164, 82 194, 69 236 C 57 275, 57 305, 68 330 Z" className="ornament-branch" />
        <path d="M130 330 C 168 286, 188 231, 206 164 C 172 167, 149 204, 138 249 C 130 280, 129 305, 130 330 Z" className="ornament-branch warm" />
        <path d="M196 128 C 214 178, 240 212, 286 238" className="ornament-branch" />
        <path d="M80 202 C 96 172, 116 148, 136 126" className="ornament-branch warm" />
        <path d="M94 166 C 122 142, 146 140, 170 150 C 154 160, 141 178, 128 202 C 112 192, 102 178, 94 166 Z" className="ornament-leaf" />
        <path d="M200 182 C 222 151, 245 130, 270 116 C 282 146, 279 171, 260 194 C 239 206, 216 201, 200 182 Z" className="ornament-leaf warm" />
        <path d="M118 84 C 139 100, 151 121, 152 144 C 125 132, 106 109, 96 80 C 102 78, 109 80, 118 84 Z" className="ornament-leaf" />
        <path d="M78 248 C 54 220, 38 202, 22 174 C 42 170, 61 175, 83 197 C 90 212, 88 233, 78 248 Z" className="ornament-leaf warm" />
        <path d="M142 102 C 163 74, 182 58, 210 57 C 201 86, 194 104, 175 122 C 162 120, 151 112, 142 102 Z" className="ornament-leaf" />
      </svg>

      <svg viewBox="0 0 360 440" className="absolute -right-10 bottom-20 h-80 w-80 md:h-[25rem] md:w-[25rem]">
        <path d="M272 350 C 238 298, 214 256, 202 208 C 244 220, 281 258, 308 322" className="ornament-branch warm" />
        <path d="M182 350 C 144 293, 117 236, 114 152 C 163 171, 201 212, 228 284" className="ornament-branch" />
        <path d="M118 182 C 92 150, 70 123, 50 82" className="ornament-branch warm" />
        <path d="M212 170 C 250 176, 283 190, 308 224" className="ornament-branch" />
        <path d="M182 238 C 207 209, 230 190, 258 180 C 273 210, 271 241, 247 262 C 219 274, 195 265, 182 238 Z" className="ornament-leaf" />
        <path d="M136 216 C 110 189, 86 163, 68 132 C 92 126, 116 136, 134 156 C 146 170, 145 193, 136 216 Z" className="ornament-leaf warm" />
        <path d="M224 120 C 248 100, 265 84, 286 66 C 299 96, 293 118, 271 138 C 250 142, 236 136, 224 120 Z" className="ornament-leaf" />
        <path d="M128 102 C 147 82, 163 64, 176 38 C 191 60, 191 90, 176 110 C 154 116, 138 111, 128 102 Z" className="ornament-leaf warm" />
        <path d="M224 104 C 236 74, 258 56, 288 56 C 278 90, 266 110, 238 126 C 230 120, 226 113, 224 104 Z" className="ornament-leaf" />
      </svg>

      <svg viewBox="0 0 540 190" className="absolute left-1/2 top-7 h-24 w-[19rem] -translate-x-1/2 opacity-90 md:h-28 md:w-[24rem]">
        <path d="M12 124 C 56 78, 102 70, 152 82 C 192 92, 224 104, 258 110 C 296 116, 338 111, 388 80 C 426 56, 472 60, 520 78" className="ornament-arch" />
        <path d="M26 138 C 72 108, 122 103, 174 112 C 214 120, 252 131, 290 135 C 336 140, 374 128, 420 98" className="ornament-arch warm" />
        <path d="M142 72 C 160 52, 180 42, 206 44 C 196 69, 188 83, 170 96 C 159 92, 149 83, 142 72 Z" className="ornament-leaf" />
        <path d="M250 92 C 272 72, 294 62, 322 64 C 310 90, 298 106, 274 117 C 260 112, 254 103, 250 92 Z" className="ornament-leaf warm" />
        <path d="M276 62 C 290 44, 308 30, 330 28 C 328 53, 320 68, 298 82 C 288 78, 281 71, 276 62 Z" className="ornament-leaf" />
        <path d="M104 92 C 122 58, 154 42, 190 46 C 180 72, 166 87, 138 102 C 125 99, 113 96, 104 92 Z" className="ornament-leaf warm" />
        <circle cx="118" cy="96" r="4.5" className="ornament-dot" />
        <circle cx="220" cy="118" r="5.5" className="ornament-dot warm" />
        <circle cx="322" cy="90" r="4.5" className="ornament-dot" />
      </svg>
    </div>
  );
}
