export class Food {
    id?: string;
    date?: string;
    name: string;
    grml: number;
    kcal: number;
    protein: number;
    carbs: number;
    fats: number;
    typeOfFood?: string;
    deletedFromFavourites?: boolean;
}
