export type Instructor = {
  name: string;
  courses: string;
  rating: number;
  reviews: number;
};

export type College = {
  id: string;
  name: string;
  depts: Record<string, Instructor[]>;
};

export const colleges: College[] = [
  {
    id: "engineering",
    name: "Engineering",
    depts: {
      "Computer Science": [
        { name: "Dr. Leila Hassan",    courses: "CMPS 101, 212", rating: 4.3, reviews: 14 },
        { name: "Dr. Sara Yusuf",      courses: "CMPS 212, 415", rating: 4.7, reviews: 22 },
        { name: "Dr. Tariq Al-Nasr",   courses: "CMPS 301",      rating: 3.1, reviews: 9  },
        { name: "Dr. Khalid Mansoor",  courses: "CMPS 480",      rating: 3.8, reviews: 6  },
      ],
      "Electrical Engineering": [
        { name: "Dr. Fatima Al-Rashid", courses: "ELEC 201, 310", rating: 4.5, reviews: 18 },
        { name: "Dr. Omar Haddad",      courses: "ELEC 450",       rating: 3.6, reviews: 11 },
      ],
      "Civil Engineering": [
        { name: "Dr. Nadia Saleh",  courses: "CVIL 201",      rating: 4.0, reviews: 8  },
        { name: "Dr. Yusuf Karim",  courses: "CVIL 310, 420", rating: 4.2, reviews: 15 },
      ],
      "Mechanical Engineering": [
        { name: "Dr. Ibrahim Al-Khatib", courses: "MECH 201", rating: 3.9, reviews: 7 },
      ],
    },
  },
  {
    id: "business",
    name: "Business",
    depts: {
      "Finance": [
        { name: "Dr. Amira Hassan",  courses: "FIN 201, 310", rating: 4.4, reviews: 20 },
        { name: "Dr. Rami Suleiman", courses: "FIN 401",      rating: 3.5, reviews: 9  },
      ],
      "Marketing": [
        { name: "Dr. Hana Al-Qasim", courses: "MKT 201, 305", rating: 4.6, reviews: 24 },
        { name: "Dr. Kareem Nasser",  courses: "MKT 410",      rating: 4.1, reviews: 12 },
      ],
      "Management": [
        { name: "Dr. Layla Farouk", courses: "MGMT 201", rating: 3.8, reviews: 16 },
      ],
    },
  },
  {
    id: "health",
    name: "Health Sciences",
    depts: {
      "Nursing": [
        { name: "Dr. Samira Osman",   courses: "NURS 101, 202", rating: 4.2, reviews: 30 },
        { name: "Dr. Ali Badawi",     courses: "NURS 301",       rating: 3.7, reviews: 18 },
      ],
      "Public Health": [
        { name: "Dr. Mona Al-Sheikh", courses: "PUBL 101, 202", rating: 4.8, reviews: 26 },
      ],
      "Pharmacy": [
        { name: "Dr. Nour Al-Din", courses: "PHAR 301", rating: 4.2, reviews: 13 },
      ],
    },
  },
  {
    id: "arts",
    name: "Arts & Sciences",
    depts: {
      "Mathematics": [
        { name: "Dr. Hassan Al-Saadi", courses: "MATH 101, 201", rating: 3.9, reviews: 14 },
        { name: "Dr. Zainab Qasim",    courses: "MATH 301",      rating: 4.1, reviews: 8  },
      ],
      "English Literature": [
        { name: "Dr. Rasha Ibrahim", courses: "ENGL 201, 305", rating: 4.7, reviews: 22 },
      ],
      "Arabic Language": [
        { name: "Dr. Yasmine Khalil", courses: "ARAB 101, 201", rating: 4.3, reviews: 19 },
      ],
    },
  },
];
