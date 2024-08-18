/** @type {Record<string, (string[] | Record<string, string[])>} */
const list = await ((await fetch('list.json')).json());

const categorySearchParam = new URLSearchParams(location.search).get('category');

/** @type string[] */
const urls = [];

const subCategoryTemplate
	= /** @type {HTMLTemplateElement} */(document.getElementById('sub-category')).content.firstElementChild;
const subOrSubSubCategoryTemplate
	= /** @type {HTMLTemplateElement} */(document.getElementById('sub-or-sub-sub-category')).content.firstElementChild;

/**
 * @param {string} categoryOrSubCategoryName
 * @returns {HTMLLIElement}
 */
function createCategoryOrSubCategoryItem(categoryOrSubCategoryName)
{
	const item = subOrSubSubCategoryTemplate.cloneNode(true);
	const anchor = item.getElementsByTagName('a')[0];
	anchor.href = '?' + new URLSearchParams({ category: categoryOrSubCategoryName });
	anchor.text = categoryOrSubCategoryName;
	return item;
}

document.getElementById('menu').append(...Object.entries(list)
	.toSorted(function ([a], [b]) {
		// 「オリジナル」を一番前へ、「その他」を一番後ろへ
		if (a === 'オリジナル' || b === 'その他') {
			return -1;
		} else if (b === 'オリジナル' || a === 'その他') {
			return 1;
		} else {
			return 0;
		}
	})
	.map(function ([ categoryName, categoryOrSubCategories ]) {
		if (categoryName === categorySearchParam) {
			urls.push(...categoryOrSubCategories);
		}
		if (Array.isArray(categoryOrSubCategories)) {
			return createCategoryOrSubCategoryItem(categoryName);
		} else {
			/** @type {HTMLUListElement} */
			const subCategory = subCategoryTemplate.cloneNode(true);
			subCategory.prepend(categoryName);
			subCategory.getElementsByTagName('ul')[0]
				.append(...Object.entries(categoryOrSubCategories).map(function ([ subCategoryName, subCategory ]) {
					if (subCategoryName === categorySearchParam) {
						urls.push(...subCategory);
					}
					return createCategoryOrSubCategoryItem(subCategoryName);
				}));
			return subCategory;
		}
	}));

if (categorySearchParam !== null) {
	if (urls.length === 0) {
		document.documentElement.innerHTML = new DOMParser()
			.parseFromString(await (await fetch('404.html')).text(), 'text/html').documentElement.innerHTML;
	} else {
		document.title = categorySearchParam + ' | ' + document.title;
		document.querySelector('#main h2').textContent = categorySearchParam;
		const list = document.querySelector('main ul');
		const template = list.getElementsByTagName('template')[0].content.firstElementChild;
		document.querySelector('main ul').append(...urls.map(function (url) {
			/** @type {HTMLLIElement} */
			const item = template.cloneNode('true');
			item.getElementsByTagName('img')[0].src = url;
			return item;
		}));
	}
}
