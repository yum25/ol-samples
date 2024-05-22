import json
import copy

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

def is_detroit(county):
    counties = ["Detroit"]

    return county["properties"]["name"] in counties

counties = json.load(open('./data/community_boundaries.json'))
counties["features"] = list(filter(borders_detroit, counties["features"]))

detroit = copy.deepcopy(counties)
detroit["features"] = list(filter(is_detroit, detroit["features"]))

with open("./src/lib/references/counties.json", "w+") as f:
    json.dump(counties, f)

with open("./src/lib/references/detroit.json", "w+") as f:
    json.dump(detroit, f)
