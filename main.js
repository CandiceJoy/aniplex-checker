import boxen     from "boxen";
import fs        from "fs";
import prompts   from "prompts";
import puppeteer from "puppeteer";

const outputFile = "results.json";
let oldData = null;
const newData = [];

if(fs.existsSync(outputFile))
{
	oldData = JSON.parse(fs.readFileSync(outputFile).toString());
}

const showBrowser = false;
const url = "https://www.aniplexplus.com/search?q=Seiko&search-button=&lang=ja_JP";
const browser = await puppeteer.launch({headless: !showBrowser});
const page = await fetchPage(url);

let showMore;

do
{
	showMore = await getElement("div.show-more > button");

	if(!showMore)
	{
		continue;
	}

	await showMore.click();
} while(showMore);

const products = await getElements("article > a > div:nth-child(2)");

for(const product of products)
{
	const text = await getText(product);
	newData.push(text);
}

if(!oldData)
{
	write();
	console.log("No data file detected, but I created it.  The next run will check for changes.");
	process.exit(0);
}

if(areArraysEqual(oldData, newData))
{
	console.log("Nothing new");
	process.exit(0);
}
else
{
	console.log(boxen("HOLY SHIT\nTHERE'S SOMETHING NEW\nGO CHECK IT OUT NOW!!!", {
		padding    : 1,
		margin     : 1,
		borderStyle: "double"
	}));

	const seen = (await prompts({
		                     type   : "confirm",
		                     name   : "value",
		                     message: "Have you seen this notification?",
		                     initial: false
	                     })).value;

	if(seen)
	{
		console.log("Writing update to file.  You will not see a notification again until something else changes.");
		write();
	}
}

function write()
{
	fs.writeFileSync(outputFile, JSON.stringify(newData, null, "\t"));
}

function areArraysEqual(arr1, arr2)
{
	if(arr1.length !== arr2.length)
	{
		return false;
	}

	for(let x = 0; x < arr1.length; x++)
	{
		if(arr1[x] !== arr2[x])
		{
			return false;
		}
	}

	return true;
}

async function getText(element)
{
	return await getAttribute(element, "textContent");
}

async function getAttribute(element, attribute)
{
	return await (await element.getProperty(attribute)).jsonValue();
}

async function getElement(selector, ancestor = null)
{
	const from = (ancestor ? ancestor : page);
	return await from.$(selector);
}

async function getElements(selector, ancestor = null)
{
	const from = (ancestor ? ancestor : page);
	return await from.$$(selector);
}

async function fetchPage(url)
{
	const page = await browser.newPage();
	await page.goto(url);
	return page;
}

if(!showBrowser)
{
	await browser.close();
}
