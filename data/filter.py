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

data = json.load(open('./data/community_boundaries.json'))
essex = json.load(open('./data/essex_boundaries.json'))
# Filter the SEMCOG file, only adding neighboring boundaries of Detroit
counties = copy.deepcopy(data)
counties["features"] = list(filter(borders_detroit, counties["features"]))

# Add geojson data for Windsor
windsor = next(filter(lambda x: x["properties"]["NAME"] == "Windsor", essex["features"]), None)
windsor["properties"]["name"] = windsor["properties"].pop("NAME")
counties["features"].append(windsor)

with open("./src/lib/references/boundaries.json", "w+") as f:
    json.dump(counties, f)

# detroit = copy.deepcopy(counties)
# detroit["features"] = list(filter(is_detroit, detroit["features"]))

# with open("./src/lib/references/detroit.json", "w+") as f:
#     json.dump(detroit, f)

# Get the names of all cities in the SEMCOG file
cities = ["Windsor"]
for county in data["features"]:
    cities.append(county["properties"]["name"])

with open("./src/lib/references/cities.json", "w+") as f:
    json.dump(cities, f)
