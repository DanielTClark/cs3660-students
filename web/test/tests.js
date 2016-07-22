
describe("nameForYear(year)", () => {
    /* global nameForYear expect */
    
    it("should return undefined for a year out of bounds", () => {
        expect(nameForYear(0)).toBe(undefined);
        expect(nameForYear(5)).toBe(undefined);
    });
    
    it("should return Freshman for a year of 1", () => {
        expect(nameForYear(1)).toBe("Freshman");
    });
    
    it("should return Sophmore for a year of 2", () => {
        expect(nameForYear(2)).toBe("Sophomore");
    });
    
    it("should return Junior for a year of 3", () => {
        expect(nameForYear(3)).toBe("Junior");
    });
    
    it("should return Senior for a year of 4", () => {
        expect(nameForYear(4)).toBe("Senior");
    });
    
});

describe("basicCmp(a, b)", () => {
    /* global basicCmp */
    
    it("should properly compare numbers numerically", () => {
        expect(basicCmp(12, 13)).toBeLessThan(0);
        expect(basicCmp(2, 12)).toBeLessThan(0); // fails if lexicographical sort is used
        expect(basicCmp(13, 12)).toBeGreaterThan(0);
        expect(basicCmp(25, -2)).toBeGreaterThan(0);
        expect(basicCmp(10, 10)).toBe(0);
        expect(basicCmp(-2, -2)).toBe(0);
        expect(basicCmp(0, 0)).toBe(0);
    });
    
    it("should compare strings lexicographically", () => {
        expect(basicCmp('a', 'a')).toBe(0);
        expect(basicCmp("long string", "long string")).toBe(0);
        expect(basicCmp("2", "12")).toBeGreaterThan(0);
    });
});

describe("cmpDate(a, b)", () => {
    /* global cmpDate */
    
    it("should compare dates", () => {
        expect(cmpDate("10/02/08", "10/02/10")).toBeLessThan(0);
        expect(cmpDate("10/02/08", "10/02/08")).toBe(0);
        expect(cmpDate("10/01/10", "10/02/10")).toBeLessThan(0);
        expect(cmpDate("8/12/10", "10/02/10")).toBeLessThan(0); // fails if dd/mm/yy is used instead of mm/dd/yy
    });
});

describe("genCmp(type, idx)", () => {
    /* global genCmp */
    
    it("should generate a function that converts strings to lower case and compares them", () => {
        expect(genCmp(undefined, "text")({text: "abc"}, {text: "abc"})).toBe(0);
        expect(genCmp(undefined, "text")({text: "abc"}, {text: "ABC"})).toBe(0);
        expect(genCmp(undefined, "text")({text: "abc"}, {text: "aBc"})).toBe(0);
        expect(genCmp(undefined, "text")({text: "ab"}, {text: "AD"})).toBeLessThan(0);
        expect(genCmp(undefined, "text")({text: "12"}, {text: "2"})).toBeLessThan(0);
        expect(genCmp(undefined, "text")({text: "cba"}, {text: "abc"})).toBeGreaterThan(0);
    });
});

describe("cmpNumber(a, b)", () => {
    /* global cmpNumber */
    
    it("should compare numbers", () => {
        expect(cmpNumber(12, 13)).toBeLessThan(0);
        expect(cmpNumber(2, 12)).toBeLessThan(0);
        expect(cmpNumber(13, 12)).toBeGreaterThan(0);
        expect(cmpNumber(25, -2)).toBeGreaterThan(0);
        expect(cmpNumber(-2, -2)).toBe(0);
        expect(cmpNumber(0, 0)).toBe(0);
    });
});

describe("cmpName(a, b)", () => {
    /* global cmpName */
    
    it("should convert strings to lower case and compare them", () => {
        expect(cmpName("abc", "abc")).toBe(0);
        expect(cmpName("abc", "ABC")).toBe(0);
        expect(cmpName("abc", "aBc")).toBe(0);
        expect(cmpName("ab", "AD")).toBeLessThan(0);
        expect(cmpName("12", "2")).toBeLessThan(0);
        expect(cmpName("cba", "abc")).toBeGreaterThan(0);
    });
});

describe("cmpFullName(a, b)", () => {
    /* global cmpFullName */
    
    it("should compare lname and fname on an object, with lname being the primary comparison", () => {
        expect(cmpFullName({lname: 'Clark', fname: 'Daniel'}, {lname: 'Clark', fname: 'Daniel'})).toBe(0);
        expect(cmpFullName({lname: 'Clark', fname: 'Daniel'}, {lname: 'Clark', fname: 'Bob'})).toBeGreaterThan(0);
        expect(cmpFullName({lname: 'Lovelace', fname: 'Ada'}, {lname: 'Babbage', fname: 'Charles'})).toBeGreaterThan(0);
    });
});


