describe("formatDate(dateString, format)", () => {
    /* global formatDate */
    
    it("should return a date in MM/DD/YYYY when told to output with that format", () => {
        expect(formatDate('11/15/99', 'MDY')).toBe('11/15/1999');
        expect(formatDate('12/10/2002', 'MDY')).toBe('12/10/2002');
    });
    
    it("should return a date as YYYY-MM-DD when told to output with that format", () => {
        expect(formatDate('11/15/99', 'YMD')).toBe('1999-11-15');
        expect(formatDate('12/10/2002', 'YMD')).toBe('2002-12-10');
    });
});


