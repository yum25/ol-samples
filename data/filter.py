import json

def borders_detroit(county):
    borders = ["Detroit", 
               "Redford Twp", 
               "Southfield", 
               "Oak Park", 
               "Royal Oak Twp", 
               "Ferndale", 
               "Hazel Park", 
               "Warren", 
               "Eastpointe", 
               "Harper Woods", 
               "Grosse Pointe Woods",
               "Grosse Pointe Farms", 
               "Grosse Pointe", 
               "Grosse Pointe Park", 
               "Hamtramck", 
               "Detroit River", 
               "Highland Park", 
               "River Rouge", 
               "Ecorse", 
               "Lincoln Park", 
               "Melvindale", 
               "Dearborn", 
               "Dearborn Heights"]

    return county["properties"]["name"] in borders

counties = json.load(open('./data/community_boundaries.json'))
counties["features"] = list(filter(borders_detroit, counties["features"]))

with open("./src/lib/references/counties.json", "w+") as f:
    json.dump(counties, f)