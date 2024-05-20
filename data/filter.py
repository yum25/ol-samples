import json

def borders_detroit(county):
    borders = ["Detroit"]

    return county["properties"]["name"] in borders

counties = json.load(open('./data/community_boundaries.json'))
counties["features"] = list(filter(borders_detroit, counties["features"]))

with open("./src/lib/references/counties.json", "w+") as f:
    json.dump(counties, f)