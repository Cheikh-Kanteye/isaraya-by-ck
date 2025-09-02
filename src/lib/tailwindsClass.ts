export const tailwindClasses = {
  searchBox: {
    root: "relative",
    form: "relative",
    input:
      "w-full px-4 py-3 text-lg bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none focus:border-transparent transition-all duration-200",
  },
  refinementList: {
    list: "space-y-2",
    item: "flex items-center",
    label:
      "flex items-center cursor-pointer hover:text-primary transition-colors group w-full",
    checkbox: "mr-2 accent-primary",
    labelText: "text-sm text-muted-foreground group-hover:text-foreground flex-grow",
    count: "ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full",
  },
  stats: {
    root: "text-sm text-muted-foreground",
    text: "text-muted-foreground",
  },
  sortBy: {
    root: "",
    select:
      "px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors",
  },
  hits: {
    root: "mb-8",
    list: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4",
    item: "bg-transparent",
  },
  clearRefinements: {
    button:
      "text-sm bg-primary/20 border border-primary text-primary/70 hover:text-primary hover:underline transition-colors",
    disabledButton:
      "bg-primary/5 border border-primary/50 text-sm text-muted-foreground cursor-not-allowed",
  },
  rangeInput: {
    root: "space-y-2",
    form: "flex space-x-2",
    input:
      "flex-1 px-2 py-1 text-sm bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent",
    separator: "text-muted-foreground mx-2",
    submit:
      "px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:bg-primary/90 transition-colors",
  },
  pagination: {
    root: "flex items-center space-x-2",
    list: "flex items-center space-x-1",
    item: "",
    link: "px-3 py-2 border border-border rounded hover:bg-muted text-foreground bg-background transition-colors",
    selectedItem: "bg-primary text-primary-foreground border-primary",
    disabledItem: "opacity-50 cursor-not-allowed",
    previousPageItem: "",
    nextPageItem: "",
    firstPageItem: "",
    lastPageItem: "",
  },
};
