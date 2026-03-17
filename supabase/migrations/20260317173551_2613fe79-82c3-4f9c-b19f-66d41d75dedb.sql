
-- Delete orphan duplicate "AP 13 - Bloco 1" (no contracts/invoices linked)
DELETE FROM properties WHERE id = 'b9f37e99-b889-4488-b182-573832dc2d0f';

-- Rename Bloco 1 properties: AP X - Bloco 1 → Ap 1XX
UPDATE properties SET name = 'Ap 101' WHERE id = 'ae1eb8ef-7b3c-4849-b560-b61676d3178a'; -- AP 01 - Bloco 1
UPDATE properties SET name = 'Ap 102' WHERE id = 'dcd85c87-3138-4407-9911-839ba3d57956'; -- AP 2 - Bloco 1
UPDATE properties SET name = 'Ap 103' WHERE id = 'f23bb997-4646-43b8-9c7d-995dc7fdc9de'; -- AP 3 - Bloco 1
UPDATE properties SET name = 'Ap 104' WHERE id = '873d7eb2-2a18-4a03-bf9b-b204ad4860c6'; -- AP 4 - Bloco 1
UPDATE properties SET name = 'Ap 105' WHERE id = 'd3438d9d-68df-4d0d-a9d6-c4c3908229a9'; -- AP 5 - Bloco 1
UPDATE properties SET name = 'Ap 106' WHERE id = 'fedbd364-8072-4dce-bd02-a61c636c0292'; -- AP 6 - Bloco 1
UPDATE properties SET name = 'Ap 107' WHERE id = '9453f837-613a-4c09-81ef-bec6c1eadff7'; -- AP 7 - Bloco 1
UPDATE properties SET name = 'Ap 108' WHERE id = 'f662759b-ff2f-48ad-9cd8-dec48244c8ea'; -- AP 8 - Bloco 1
UPDATE properties SET name = 'Ap 109' WHERE id = '0f890ece-cd40-41e5-bfe4-e3a9b48d8cd9'; -- AP 9 - Bloco 1
UPDATE properties SET name = 'Ap 110' WHERE id = '4c31f66c-482f-440d-9e82-251510d34fef'; -- AP 10 - Bloco 1
UPDATE properties SET name = 'Ap 111' WHERE id = '9680d22d-68d1-4a11-9223-f5c9325fba07'; -- AP 11 - Bloco 1
UPDATE properties SET name = 'Ap 112' WHERE id = '9a297122-b34d-437a-b679-0c976d9372e9'; -- AP 12 - Bloco 1
UPDATE properties SET name = 'Ap 113' WHERE id = '9fc8d027-f191-4744-bafb-54551315053d'; -- AP 13 - Bloco 1 (the one with contracts)
UPDATE properties SET name = 'Ap 114' WHERE id = '6a2a2da1-1539-4e40-aac7-2f6bf00e3856'; -- AP 14 - Bloco 1
UPDATE properties SET name = 'Ap 115' WHERE id = '73e3d934-7364-4e1b-ad46-15aa855cf950'; -- AP 15 - Bloco 1
UPDATE properties SET name = 'Ap 116' WHERE id = 'bff579c5-5b4a-4a73-a975-6d70e87a9288'; -- AP 16 - Bloco 1
UPDATE properties SET name = 'Ap 117' WHERE id = 'bf143d3f-08a3-4a64-ac86-c86c19aa3061'; -- AP 17 - Bloco 1
UPDATE properties SET name = 'Ap 118' WHERE id = 'ac78eec9-532e-4a75-b274-7eb5a1f7e0a2'; -- AP 18 - Bloco 1
UPDATE properties SET name = 'Ap 119' WHERE id = '5e7a8a6c-93fa-494a-b31f-de1c0e21fa77'; -- AP 19 - Bloco 1
UPDATE properties SET name = 'Ap 120' WHERE id = 'b5a1db8a-102b-496b-be78-16bf47588c0f'; -- AP 20 - Bloco 1
UPDATE properties SET name = 'Ap 121' WHERE id = '2f62d9dd-11bd-452d-b910-948befba52fb'; -- AP 21 - Bloco 1
UPDATE properties SET name = 'Ap 122' WHERE id = 'e4738671-d9cd-4c91-adc4-702bc5464099'; -- AP 22 - Bloco 1
UPDATE properties SET name = 'Ap 123' WHERE id = '4dacd6c7-7d1e-4d4f-bc50-82ff32e878ad'; -- AP 23 - Bloco 1
UPDATE properties SET name = 'Ap 124' WHERE id = '7871f554-71d6-407b-be1a-f703a23b1f61'; -- AP 24 - Bloco 1
UPDATE properties SET name = 'Ap 125' WHERE id = 'cf7b0320-a0be-4b4d-ab25-992808c7347e'; -- AP 25 - Bloco 1
UPDATE properties SET name = 'Ap 126' WHERE id = 'c90a3a6d-c4f0-4e74-b3cc-6a2d904d0057'; -- AP 26 - Bloco 1
UPDATE properties SET name = 'Ap 127' WHERE id = '120392c2-2161-4070-85f5-126e63174f0f'; -- AP 27 - Bloco 1
UPDATE properties SET name = 'Ap 128' WHERE id = '2bf41eeb-2d23-42ff-b331-e3a3a5b7423a'; -- AP 28 - Bloco 1
UPDATE properties SET name = 'Ap 129' WHERE id = 'ab383b7a-a7bc-4690-9d7d-84bda9485dce'; -- AP 29 - Bloco 1
UPDATE properties SET name = 'Ap 130' WHERE id = '60bb7cb5-f2da-474e-92bb-06800e53d308'; -- AP 30 - Bloco 1

-- Rename Bloco 2 properties: AP X - Bloco 2 → Ap 2XX
UPDATE properties SET name = 'Ap 201' WHERE id = 'e49ba692-2ca1-4b1f-a86a-a2c840807018'; -- AP 1 - Bloco 2
UPDATE properties SET name = 'Ap 202' WHERE id = '80f711d9-c19e-4952-894f-be883fe37bb6'; -- AP 2 - Bloco 2
UPDATE properties SET name = 'Ap 203' WHERE id = '7b400e48-5769-494c-9700-c4edc6c6650c'; -- AP 3 - Bloco 2
UPDATE properties SET name = 'Ap 204' WHERE id = '5585f299-5efe-47d9-87d7-f2e83810a268'; -- AP 4 - Bloco 2
UPDATE properties SET name = 'Ap 205' WHERE id = '4bae12ff-234e-41c8-b6a3-848629177ee5'; -- AP 5 - Bloco 2
UPDATE properties SET name = 'Ap 206' WHERE id = '3fb2dbaa-dcb6-4ac4-a81d-46fa150c8e89'; -- AP 6 - Bloco 2
UPDATE properties SET name = 'Ap 207' WHERE id = 'a10ab344-871e-4f0f-ab9e-da8161d6cee1'; -- AP 7 - Bloco 2
UPDATE properties SET name = 'Ap 208' WHERE id = '502ed9ce-849d-44ed-bca7-8a9d977f8c9b'; -- AP 8 - Bloco 2
UPDATE properties SET name = 'Ap 209' WHERE id = '89699438-ccb8-4c8d-ac02-a448527fdfca'; -- AP 9 - Bloco 2
UPDATE properties SET name = 'Ap 210' WHERE id = '71459fb1-c9fa-496e-b90c-2a57b939ecbc'; -- AP 10 - Bloco 2
UPDATE properties SET name = 'Ap 211' WHERE id = 'f85aa4e9-8201-4dba-bb6e-82ff19c805ca'; -- AP 11 - Bloco 2
UPDATE properties SET name = 'Ap 212' WHERE id = 'f2357d3b-f183-4550-a4aa-b5a2cc0810ef'; -- AP 12 - Bloco 2
UPDATE properties SET name = 'Ap 213' WHERE id = '55ea0aa5-52c7-4882-b797-8040ce62174d'; -- AP 13 - Bloco 2
UPDATE properties SET name = 'Ap 214' WHERE id = 'e850cfa5-a12b-4876-af7b-10e4eb4c4468'; -- AP 14 - Bloco 2
UPDATE properties SET name = 'Ap 215' WHERE id = 'cbf7a98f-e316-4105-873a-c813ae05b3ef'; -- AP 15 - Bloco 2
UPDATE properties SET name = 'Ap 216' WHERE id = '3cde16ba-5e61-4f11-9585-542440ad2c49'; -- AP 16 - Bloco 2
UPDATE properties SET name = 'Ap 217' WHERE id = '3d474594-fc4a-4af1-a5b2-a09fc208ef35'; -- AP 17 - Bloco 2
UPDATE properties SET name = 'Ap 218' WHERE id = '5b9976e1-dfa2-4ec5-becb-f0414aab16b6'; -- AP 18 - Bloco 2
UPDATE properties SET name = 'Ap 219' WHERE id = '8e017388-196c-45cb-a64e-fe9dbde4429a'; -- AP 19 - Bloco 2
UPDATE properties SET name = 'Ap 220' WHERE id = 'c3b042d0-b2f1-40c2-abc4-2c4b4e4172e2'; -- AP 20 - Bloco 2
UPDATE properties SET name = 'Ap 221' WHERE id = '64c35660-d30f-40be-89c9-7fecacf68329'; -- AP 21 - Bloco 2
UPDATE properties SET name = 'Ap 222' WHERE id = '04cfefef-e6a3-42c1-84f0-5db5c80f98f5'; -- AP 22 - Bloco 2
UPDATE properties SET name = 'Ap 223' WHERE id = 'c05461d4-531c-402c-91ba-74d90f5ed195'; -- AP 23 - Bloco 2
UPDATE properties SET name = 'Ap 224' WHERE id = '8141d9a8-b657-4ba2-895b-2515d80c7bbc'; -- AP 24 - Bloco 2
UPDATE properties SET name = 'Ap 225' WHERE id = 'b7a0e979-d497-4395-bf15-effeee553472'; -- AP 25 - Bloco 2
UPDATE properties SET name = 'Ap 226' WHERE id = '6b2c6d39-f952-4809-b4f8-9e92676c0713'; -- AP 26 - Bloco 2
UPDATE properties SET name = 'Ap 227' WHERE id = 'edc67827-56bb-4236-9470-8eee4f74775d'; -- AP 27 - Bloco 2
UPDATE properties SET name = 'Ap 228' WHERE id = 'e6160662-3825-4f6f-9dea-41600e7d4537'; -- AP 28 - Bloco 2
UPDATE properties SET name = 'Ap 229' WHERE id = '7e396cb2-9ca4-471e-a968-7aebeb13ea9d'; -- AP 29 - Bloco 2
UPDATE properties SET name = 'Ap 230' WHERE id = 'b5a78a17-6abc-4349-b97f-d4fce6ebaf5a'; -- AP 30 - Bloco 2

-- Rename Bloco 3 properties: AP XXX - Bloco 3 → Ap XXX
UPDATE properties SET name = 'Ap 301' WHERE id = 'c6dc56b3-f204-41d7-83fe-f257348c97cc'; -- AP 301 - Bloco 3
UPDATE properties SET name = 'Ap 302' WHERE id = '7cf1935d-1f74-4287-9000-863018fa8994'; -- AP 302 - Bloco 3
UPDATE properties SET name = 'Ap 303' WHERE id = 'b1ef708a-655a-44ad-a425-cb15c792d110'; -- AP 303 - Bloco 3
UPDATE properties SET name = 'Ap 304' WHERE id = '22d9151c-0ae5-4746-ad30-51d37d4ed961'; -- AP 304 - Bloco 3
UPDATE properties SET name = 'Ap 305' WHERE id = '84ed20df-bd18-4eb6-b8a8-d3a8ac353940'; -- AP 305 - Bloco 3
UPDATE properties SET name = 'Ap 306' WHERE id = '30c6c14f-e193-4a85-bd6a-fd2125217fea'; -- AP 306 - Bloco 3
UPDATE properties SET name = 'Ap 307' WHERE id = '9d6ba57e-08d7-45f2-8c4e-c7b333064fb8'; -- AP 307 - Bloco 3
UPDATE properties SET name = 'Ap 308' WHERE id = '318d3975-990b-478e-9efd-e2345945663d'; -- AP 308 - Bloco 3
UPDATE properties SET name = 'Ap 309' WHERE id = '8c86b10d-e01a-4983-aa87-bd2e5c30af6d'; -- AP 309 - Bloco 3
UPDATE properties SET name = 'Ap 310' WHERE id = '9be03d34-9f30-4513-b723-af1e935b0276'; -- AP 310 - Bloco 3
UPDATE properties SET name = 'Ap 311' WHERE id = '10029adf-4348-4996-bf78-1c5efc2c2b7f'; -- AP 311 - Bloco 3
UPDATE properties SET name = 'Ap 312' WHERE id = '264d92b4-e841-4e6d-a737-26a443093172'; -- AP 312 - Bloco 3
UPDATE properties SET name = 'Ap 313' WHERE id = 'bbe0d818-f449-42cd-b1a9-371735afa2d3'; -- AP 313 - Bloco 3
UPDATE properties SET name = 'Ap 314' WHERE id = 'b2322bc7-2f14-4160-a57c-4b2278a35c64'; -- AP 314 - Bloco 3
UPDATE properties SET name = 'Ap 315' WHERE id = '46339398-e77a-4992-ac09-d9861455a0eb'; -- AP 315 - Bloco 3
UPDATE properties SET name = 'Ap 316' WHERE id = '190a72b2-455e-4bfb-8f97-b773f9cd0ee3'; -- AP 316 - Bloco 3
