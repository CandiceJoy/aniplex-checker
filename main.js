import boxen     from "boxen";
import fs        from "fs";
import prompts   from "prompts";
import puppeteer from "puppeteer";
import chalk     from "chalk";
import util      from "util";

async function wait()
{
	while(!(await prompts({
		                      type   : "confirm",
		                      name   : "value",
		                      message: "Exit program?",
		                      initial: false
	                      })).value)
	{
		;
	}
}

try
{
	console.clear();
	const outputFile = "results.json";
	let oldData = null;
	const newData = [];

	/*
	 Exit Codes:

	 0 - Nothing new
	 1 - Error
	 2 - No data file
	 3 - Changes detected
	 */

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
		await wait();
		process.exit(2);
	}

	if(areArraysEqual(oldData, newData))
	{
		console.log(boxen(`Nothing new`, {
			padding    : 1,
			margin     : 1,
			float      : "center",
			borderStyle: "double",
		}));

		process.exit(0);
	}
	else
	{
		console.log(boxen(
			chalk.magenta("HOLY SHIT\n") + chalk.yellow("THERE'S SOMETHING NEW\n") + chalk.cyan("GO CHECK IT OUT NOW!!!"),
			{
				padding    : 1,
				margin     : 1,
				float      : "center",
				textAlignment: "center",
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

		process.exit(3);
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
}
catch(err)
{
	console.log(boxen(`${chalk.red("ERROR")}\n\n${chalk.red(util.inspect(err))}`, {
		padding    : 1,
		margin     : 1,
		float      : "center",
		borderStyle: "double",
	}));

	await wait();
	process.exit(1);
}
