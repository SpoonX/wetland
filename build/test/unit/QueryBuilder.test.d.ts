declare let exampleCriteria: {
    name: string;
    or: any[];
    and: any[];
    city: {
        like: string;
    };
    country: {
        contains: string;
    };
    status: {
        gt: number;
    };
    group: {
        name: string;
        active: boolean;
    };
    categories: {
        and: any[];
        type: string;
        active: {
            '>': number;
        };
    };
};
