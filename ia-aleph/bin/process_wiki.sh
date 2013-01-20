#!/bin/bash

targetDir="$1"
plist="$2"
wikiFile="$3"
lang="$4"
baseUrl="$5"

pushd "$targetDir" || exit 1

backup=`mktemp -u /tmp/backup_wiki_XXXX.zip`
zip -9 -q $backup *
echo "processing data from dir $targetDir, page file $plist, wiki file $wikiFile, lang $lang (backup of original data in $backup)"

counter=`mktemp`
echo 0 > $counter

newName(){
#	[ -z "$counter" ] && counter=1
	cv=$(cat $counter)
	res=$[cv++];
	echo $cv > $counter
	res=$( echo 00000000${res} | tail -c8 )
	if file --mime-type -b "$1" | grep -q text; then
		if echo "$1" | grep -q '[.]html$'; then
			echo "${res}.html"
		elif echo "$1" | egrep -q '([.]css$)|([.]css[^a-zA-Z])'; then
			echo "${res}.css"
		elif echo "$1" | egrep -q '([.]js$)|([.]js[^a-zA-Z])'; then
			echo "${res}.js"
		else
			echo "********** undetected type for $1" >&2
			echo "${res}"
		fi
	elif file --mime-type -b "$1" | grep -q image; then
		echo "${res}.jpg"
	else 
		echo "********** undetected type for $1" >&2
                echo "${res}"
        fi
}

echo "removing js"
find -type f -name '*.js' -delete

	echo "cleaning names"
#	t=`mktemp -d`
	renamescript=`mktemp`
	pages=`mktemp`
	find -type f  | sort | while read file; do
#		counter='0'
		newName=$(newName "$file")
		if file -b "$file" | grep -q PNG; then
#			newName="$(echo "$newName" | sed 's#[.]png$##i').jpg"
			convert -verbose "$file" "$newName"
			rm "$file"
		else
#			if ( file "$file" | grep -q 'JPEG image' ) && ( echo "$newName" | grep -v -q '[.]jpg$' ); then
#				newName="${newName}.jpg"
#			fi
			mv -v "$file" "$newName" || continue
		fi
		echo -e "${newName}\t${file}" >> $pages
		{
			echo -n 's|"'
			echo -n "$file" | sed -r 's#[^a-zA-Z0-9]+#[^"]*#g'
			echo -n '(["#])|"'
			echo -n "${newName}"
			echo '\1|g'
		 } >> $renamescript
	done
        t=`mktemp`
        cat $renamescript | awk '{ print length, $0 }' | sort -n -k1 -r | cut -d' ' -f2- > $t
        renamescript=$t
	echo "renaming in files (source from ${renamescript})"
	sed -r -i -f $renamescript *.html *.css
	echo "updating page names"
	
echo "parsing pages from files $plist and $pages"
{
# echo -e "\t<pages lang=\"${lang}\">"
first=`mktemp`
echo -e "\t{\n\t\t\"lang\":\"${lang}\",\n\t\t\"baseurl\":\"${baseUrl}\",\n\t\t\"pages\":[\n"
 cat $plist | egrep -v '^(Bookmarks|Wiki.*)$' | sed  -r -e 's#%28#(#g' -e 's#%29#)#g' -e 's#(%..)+#_#g' | while read page; do 
	regexp="^[a-zA-Z0-9.-]+.[^a-zA-Z0-9]*$(echo "$page" | sed -r 's#[^a-zA-Z0-9]+#[^a-zA-Z0-9]*#g')[^a-zA-Z0-9]*.html$"
	fileName="$(egrep "${regexp}" $pages | cut -f1 | head -n1)"
	if [ -e "$fileName" ]; then
#		echo -e "\t\t<page fileName=\"${fileName}\">$page</page>"; 
		[ -e $first ] && rm $first ||  echo ","
		echo -e "\t\t{\n\t\t\t\"filename\":\"${fileName}\",\n\t\t\t\"pagename\":\"${page}\"\n\t\t}"
	else
		echo "********** skipping page $page (regexp $regexp ), no match" >&2
	fi
#	echo -e "\t\t<page>$page</page>"; 
done
# echo -e "\t</pages>"
#	echo 
	echo -e "\t\t],"
echo -e "\t\"date\":\"$(echo 'print((new Date()).toString());' | js)\""
	echo -e "\t}"
} >> "${wikiFile}"

	echo "cleaned names"

	find -type d -delete

{
	echo '#banner , #title , .tabArea { display:none !important; }'
	echo '.content { margin-left: 10px !important; }'
}  >> "`ls *.css | tail -n1`"

rm $counter

for file in *.html; do 
	php ~/svn/ia-aleph/trunk/ia-aleph_v2/bin/clean_wiki_page.php "$file" || echo "error on $file"
done

exit 0

