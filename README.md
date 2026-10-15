# English Quiz Room

İngilis dili müəllimi üçün test tətbiqi. Şagirdlər yaş qrupu və mövzu seçib test işləyir, müəllim nəticələri paneldə görür.

- **Yaş qrupları:** 4–5, 6–8, 9–11, 12–14, 15–17, 18+
- **Səviyyələr:** Early (4–5 yaş, şəkil və səslə), Pre-A1, A1, A2, B1, B2, C1. Yaşdan asılı deyil: 13 yaşlı şagird B2, böyük şagird A1 seçə bilər.
- **Mövzular:** 40 mövzu (hər səviyyədə 6–7), hər mövzu 4–5 bacarığa bölünüb, hər mövzuda 15 sual (cəmi 600 sual)
- **Test:** hər cəhddə 10 sual seçilir, bütün bacarıqlar bərabər əhatə olunur; nəticədə bacarıqlar üzrə bal göstərilir
- **Qrammatika bölməsi (`/grammar`):** 8 nitq hissəsi (Nouns, Pronouns, Articles, Adjectives, Adverbs, Verbs, Prepositions, Conjunctions), hər birində A1 → A2 → B1 ardıcıllığı ilə dərslər. Testdən 70% və yuxarı alanda dərs tamamlanmış sayılır, irəliləyiş şagirdin brauzerində saxlanılır.
- **Stack:** Next.js 15 (App Router) + TypeScript, database yoxdur

## İşə salmaq

```bash
npm install
npm run dev        # http://localhost:3001
```

## Struktur

| Yer | Nə edir |
|---|---|
| `data/questions.json` | Yaş qrupları, səviyyələr, mövzular və bütün suallar. Sual əlavə etmək üçün yalnız bu faylı dəyişin. |
| `scripts/check-data.mjs` | `npm run check` — sual bazasını yoxlayır (build-dən əvvəl avtomatik işləyir). |
| `data/mock-results.json` | Müəllim panelində həmişə göstəriləcək nümunə nəticələr üçün yer (hazırda boşdur). |
| `lib/storage.ts` | Nəticələrin saxlandığı yer. Gələcəkdə real bazaya keçəndə yalnız bu fayl dəyişəcək. |
| `app/api/questions` | `GET` bütün sualları qaytarır. |
| `app/api/results` | `GET` nəticələr (müəllim üçün), `POST` şagirdin yeni nəticəsi. |
| `app/page.tsx`, `app/teacher/page.tsx` | Şagird və müəllim səhifələri. |

### Mövzu formatı

```json
{
  "id": "modals",
  "level": "b2",
  "ages": ["12-14", "15-17", "18+"],
  "title": "Modals of Deduction",
  "az": "Ehtimal bildirən modal feillər",
  "skills": [
    { "id": "present", "label": "İndiki zamanda ehtimal" },
    { "id": "past", "label": "Keçmişə aid ehtimal" }
  ],
  "questions": [ ... ]
}
```

`level` mövzunun səviyyəsidir. `ages` mövzunun hansı yaşlara uyğun olduğunu göstərir: uyğun yaşlarda mövzu siyahının əvvəlində çıxır, digərlərində isə qeyd ilə göstərilir. Heç vaxt gizlədilmir. `ages` yazılmasa, mövzu bütün yaşlara uyğun sayılır. Yaş qrupunun `typical` sahəsi həmin yaş üçün “tipik” kimi işarələnən səviyyələrdir.

### Sual formatı

```json
{
  "skill": "animal-names",
  "picture": "🐶",
  "question": "This is a ___.",
  "options": ["cat", "cow", "dog", "fish"],
  "answer": 2,
  "explain": "İzah (istəyə görə)"
}
```

`skill` mövzunun `skills` siyahısındakı bacarıqlardan biridir; hər bacarıqda ən azı 3 sual olması tövsiyə olunur. 4–5 yaş üçün suallarda `"say"` (brauzerin səsləndirdiyi ingilis mətni) və `"pictureOptions": true` (variantlar böyük şəkil kimi) istifadə olunur; mövzunun `"quizSize"` sahəsi bir testdəki sual sayını dəyişir. `answer` düzgün variantın indeksidir (0-dan başlayır). `___` ekranda boşluq xətti kimi göstərilir.

## Nəticələr haqqında

Database olmadığı üçün şagirdlərin yeni nəticələri serverin yaddaşında saxlanılır. Vercel serverless funksiyanı yenidən başladanda (adətən bir neçə dəqiqə istifadə olunmayanda) bu nəticələr silinir. Şagirdin ən yaxşı balı onun öz brauzerində də qalır.

## Vercel-ə deploy

1. Layihəni GitHub-a push edin.
2. vercel.com → **Add New → Project** → repo-nu seçin. Framework avtomatik "Next.js" kimi tanınır.
3. İstəsəniz **Settings → Environment Variables** bölməsində `TEACHER_PIN` əlavə edin. Onda müəllim paneli PIN kodla açılır.

Ya da CLI ilə: `npx vercel` (sonra production üçün `npx vercel --prod`).
