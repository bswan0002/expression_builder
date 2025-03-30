# Reference Manual

CodeMirror is published as a set of NPM packages under
the

`@codemirror`scope. The core packages are listed in
this reference guide.

Each package exposes

ECMAScript and

CommonJS modules.
You'll have to use some kind of

bundler or

loader to
run them in the browser.

The most important modules
are

`state`, which contains the data
structures that model the editor state,
and

`view`, which provides the UI
component for an editor.

A minimal editor might look like this:

import { EditorView , keymap } from "@codemirror/view" import { defaultKeymap } from "@codemirror/commands" let myView = new EditorView ( { doc : "hello" , extensions : [ keymap . of ( defaultKeymap ) ], parent : document . body } ) But such an editor is going to be rather primitive. To get
functionality
like

highlighting ,
a

line number gutter , or
an

undo history , you need
to

add more
extensions to your editor.

To quickly get started, the

codemirror package provides a bundle of extensions to set up a functioning
editor.

@codemirror/ state In its most basic form, an editor's state is made up of a current

document and a

selection . Because there are a
lot of extra pieces that an editor might need to keep in its state
(such as an

undo history or

syntax
tree ), it is possible for extensions to add
additional

fields to the state object.

interface EditorStateConfig Options passed when

creating an
editor state.

doc `⁠?:`string `|`Text The initial document. Defaults to an empty document. Can be
provided either as a plain string (which will be split into
lines according to the value of the

`lineSeparator`facet ), or an instance of
the

`Text`class (which is what the state will use
to represent the document).

selection `⁠?:`EditorSelection `| {`anchor `:`number `,`head `⁠?:`number `}`The starting selection. Defaults to a cursor at the very start
of the document.

extensions `⁠?:`Extension Extension(s) to associate with this state.

class EditorState The editor state class is a persistent (immutable) data structure.
To update a state, you

create a

transaction , which produces a

new state
instance, without modifying the original object.

As such,

never mutate properties of a state directly. That'll
just break things.

doc `:`Text The current document.

selection `:`EditorSelection The current selection.

field `<`T `>(`field `:`StateField `<`T `>) →`T field `<`T `>(`field `:`StateField `<`T `>,`require `:`false `) →`T `|`undefined Retrieve the value of a

state field . Throws
an error when the state doesn't have that field, unless you pass

`false`as second parameter.

update `(...`specs `:`readonly TransactionSpec `[]) →`Transaction Create a

transaction that updates this
state. Any number of

transaction specs can be passed. Unless

`sequential`is set, the

changes (if any) of each spec
are assumed to start in the

current document (not the document
produced by previous specs), and its

selection and

effects are assumed to refer
to the document created by its

own changes. The resulting
transaction contains the combined effect of all the different
specs. For

selection , later
specs take precedence over earlier ones.

replaceSelection `(`text `:`string `|`Text `) →`TransactionSpec Create a

transaction spec that
replaces every selection range with the given content.

changeByRange `(`f : fn ( range : SelectionRange ) → { range : SelectionRange , changes ⁠?: ChangeSpec , effects ⁠?: StateEffect < any > | readonly StateEffect < any >[] } `) → {`changes : ChangeSet , selection : EditorSelection , effects : readonly StateEffect < any >[] `}`Create a set of changes and a new selection by running the given
function for each range in the active selection. The function
can return an optional set of changes (in the coordinate space
of the start document), plus an updated range (in the coordinate
space of the document produced by the call's own changes). This
method will merge all the changes and ranges into a single
changeset and selection, and return it as a

transaction
spec , which can be passed to

`update`.

changes `(`spec `⁠?:`ChangeSpec = [] `) →`ChangeSet Create a

change set from the given change
description, taking the state's document length and line
separator into account.

toText `(`string `:`string `) →`Text Using the state's

line
separator , create a

`Text`instance from the given string.

sliceDoc `(`from `⁠?:`number = 0 `,`to `⁠?:`number = this.doc.length `) →`string Return the given range of the document as a string.

facet `<`Output `>(`facet `:`FacetReader `<`Output `>) →`Output Get the value of a state

facet .

toJSON `(`fields `⁠?:`Object `<`StateField `<`any `>>) →`any Convert this state to a JSON-serializable object. When custom
fields should be serialized, you can pass them in as an object
mapping property names (in the resulting object, which should
not use

`doc`or

`selection`) to fields.

tabSize `:`number The size (in columns) of a tab in the document, determined by
the

`tabSize`facet.

lineBreak `:`string Get the proper

line-break string for this state.

readOnly `:`boolean Returns true when the editor is

configured to be read-only.

phrase `(`phrase `:`string `, ...`insert `:`any `[]) →`string Look up a translation for the given phrase (via the

`phrases`facet), or return the
original string if no translation is found.

If additional arguments are passed, they will be inserted in
place of markers like

`$1`(for the first value) and

`$2`, etc.
A single

`$`is equivalent to

`$1`, and

`$$`will produce a
literal dollar sign.

languageDataAt `<`T `>(`name `:`string `,`pos `:`number `,`side `⁠?:`-1 `|`0 `|`1 = -1 `) →`readonly T `[]`Find the values for a given language data field, provided by the
the

`languageData`facet.

Examples of language data fields are...

`"commentTokens"`- for specifying
comment syntax.
`"autocomplete"`- for providing language-specific completion sources.
`"wordChars"`- for adding
characters that should be considered part of words in this
language.
`"closeBrackets"`- controls
bracket closing behavior.
charCategorizer `(`at `:`number `) →`fn `(`char `:`string `) →`CharCategory Return a function that can categorize strings (expected to
represent a single

grapheme cluster )
into one of:

- Word (contains an alphanumeric character or a character
explicitly listed in the local language's
`"wordChars"`- language data, which should be a string)
- Space (contains only whitespace)
- Other (anything else)
wordAt `(`pos `:`number `) →`SelectionRange `|`null Find the word at the given position, meaning the range
containing all

word characters
around it. If no word characters are adjacent to the position,
this returns null.

static fromJSON `(`json : any , config ⁠?: EditorStateConfig = {} , fields ⁠?: Object < StateField < any >> `) →`EditorState Deserialize a state from its JSON representation. When custom
fields should be deserialized, pass the same object you passed
to

`toJSON`when serializing as
third argument.

static create `(`config `⁠?:`EditorStateConfig = {} `) →`EditorState Create a new state. You'll usually only need this when
initializing an editor—updated states are created by applying
transactions.

static allowMultipleSelections `:`Facet `<`boolean `,`boolean `>`A facet that, when enabled, causes the editor to allow multiple
ranges to be selected. Be careful though, because by default the
editor relies on the native DOM selection, which cannot handle
multiple selections. An extension like

`drawSelection`can be used to make
secondary selections visible to the user.

static tabSize `:`Facet `<`number `,`number `>`Configures the tab size to use in this state. The first
(highest-precedence) value of the facet is used. If no value is
given, this defaults to 4.

static lineSeparator `:`Facet `<`string `,`string `|`undefined `>`The line separator to use. By default, any of

`"\n"`,

`"\r\n"`and

`"\r"`is treated as a separator when splitting lines, and
lines are joined with

`"\n"`.

When you configure a value here, only that precise separator
will be used, allowing you to round-trip documents through the
editor without normalizing line separators.

static readOnly `:`Facet `<`boolean `,`boolean `>`This facet controls the value of the

`readOnly`getter, which is
consulted by commands and extensions that implement editing
functionality to determine whether they should apply. It
defaults to false, but when its highest-precedence value is

`true`, such functionality disables itself.

Not to be confused with

`EditorView.editable`, which
controls whether the editor's DOM is set to be editable (and
thus focusable).

static phrases `:`Facet `<`Object `<`string `>>`Registers translation phrases. The

`phrase`method will look through
all objects registered with this facet to find translations for
its argument.

static languageData `:`Facet `<`fn ( state : EditorState , pos : number , side : -1 | 0 | 1 ) → readonly Object < any >[] `>`A facet used to register

language
data providers.

static changeFilter `:`Facet `<`fn `(`tr `:`Transaction `) →`boolean `|`readonly number `[]>`Facet used to register change filters, which are called for each
transaction (unless explicitly

disabled ), and can suppress
part of the transaction's changes.

Such a function can return

`true`to indicate that it doesn't
want to do anything,

`false`to completely stop the changes in
the transaction, or a set of ranges in which changes should be
suppressed. Such ranges are represented as an array of numbers,
with each pair of two numbers indicating the start and end of a
range. So for example

`[10, 20, 100, 110]`suppresses changes
between 10 and 20, and between 100 and 110.

static transactionFilter `:`Facet `<`fn ( tr : Transaction ) → TransactionSpec | readonly TransactionSpec [] `>`Facet used to register a hook that gets a chance to update or
replace transaction specs before they are applied. This will
only be applied for transactions that don't have

`filter`set to

`false`. You
can either return a single transaction spec (possibly the input
transaction), or an array of specs (which will be combined in
the same way as the arguments to

`EditorState.update`).

When possible, it is recommended to avoid accessing

`Transaction.state`in a filter,
since it will force creation of a state that will then be
discarded again, if the transaction is actually filtered.

(This functionality should be used with care. Indiscriminately
modifying transaction is likely to break something or degrade
the user experience.)

static transactionExtender `:`Facet `<`fn ( tr : Transaction ) → Pick < TransactionSpec , "effects" | "annotations" > | null `>`This is a more limited form of

`transactionFilter`,
which can only add

annotations and

effects .

But , this type
of filter runs even if the transaction has disabled regular

filtering , making it suitable
for effects that don't need to touch the changes or selection,
but do want to process every transaction.

Extenders run

after filters, when both are present.

class SelectionRange A single selection range. When

`allowMultipleSelections`is enabled, a

selection may hold
multiple ranges. By default, selections hold exactly one range.

from `:`number The lower boundary of the range.

to `:`number The upper boundary of the range.

anchor `:`number The anchor of the range—the side that doesn't move when you
extend it.

head `:`number The head of the range, which is moved when the range is

extended .

empty `:`boolean True when

`anchor`and

`head`are at the same position.

assoc `:`-1 `|`0 `|`1 If this is a cursor that is explicitly associated with the
character on one of its sides, this returns the side. -1 means
the character before its position, 1 the character after, and 0
means no association.

bidiLevel `:`number `|`null The bidirectional text level associated with this cursor, if
any.

goalColumn `:`number `|`undefined The goal column (stored vertical offset) associated with a
cursor. This is used to preserve the vertical position when

moving across
lines of different length.

map `(`change `:`ChangeDesc `,`assoc `⁠?:`number = -1 `) →`SelectionRange Map this range through a change, producing a valid range in the
updated document.

extend `(`from `:`number `,`to `⁠?:`number = from `) →`SelectionRange Extend this range to cover at least

`from`to

`to`.

eq `(`other `:`SelectionRange `,`includeAssoc `⁠?:`boolean = false `) →`boolean Compare this range to another range.

toJSON `() →`any Return a JSON-serializable object representing the range.

static fromJSON `(`json `:`any `) →`SelectionRange Convert a JSON representation of a range to a

`SelectionRange`instance.

class EditorSelection An editor selection holds one or more selection ranges.

ranges `:`readonly SelectionRange `[]`The ranges in the selection, sorted by position. Ranges cannot
overlap (but they may touch, if they aren't empty).

mainIndex `:`number The index of the

main range in the selection (which is
usually the range that was added last).

map `(`change `:`ChangeDesc `,`assoc `⁠?:`number = -1 `) →`EditorSelection Map a selection through a change. Used to adjust the selection
position for changes.

eq `(`other `:`EditorSelection `,`includeAssoc `⁠?:`boolean = false `) →`boolean Compare this selection to another selection. By default, ranges
are compared only by position. When

`includeAssoc`is true,
cursor ranges must also have the same

`assoc`value.

main `:`SelectionRange Get the primary selection range. Usually, you should make sure
your code applies to

all ranges, by using methods like

`changeByRange`.

asSingle `() →`EditorSelection Make sure the selection only has one range. Returns a selection
holding only the main range from this selection.

addRange `(`range `:`SelectionRange `,`main `⁠?:`boolean = true `) →`EditorSelection Extend this selection with an extra range.

replaceRange `(`range `:`SelectionRange `,`which `⁠?:`number = this.mainIndex `) →`EditorSelection Replace a given range with another range, and then normalize the
selection to merge and sort ranges if necessary.

toJSON `() →`any Convert this selection to an object that can be serialized to
JSON.

static fromJSON `(`json `:`any `) →`EditorSelection Create a selection from a JSON representation.

static single `(`anchor `:`number `,`head `⁠?:`number = anchor `) →`EditorSelection Create a selection holding a single range.

static create `(`ranges : readonly SelectionRange [], mainIndex ⁠?: number = 0 `) →`EditorSelection Sort and merge the given set of ranges, creating a valid
selection.

static cursor `(`pos : number , assoc ⁠?: number = 0 , bidiLevel ⁠?: number , goalColumn ⁠?: number `) →`SelectionRange Create a cursor selection range at the given position. You can
safely ignore the optional arguments in most situations.

static range `(`anchor : number , head : number , goalColumn ⁠?: number , bidiLevel ⁠?: number `) →`SelectionRange Create a selection range.

enum CharCategory The categories produced by a

character
categorizer . These are used
do things like selecting by word.

Word Word characters.

Space Whitespace.

Other Anything else.

### Text

The

`Text`type stores documents in an immutable tree-shaped
representation that allows:

Efficient indexing both by code unit offset and by line number.

Structure-sharing immutable updates.

Access to and iteration over parts of the document without copying
or concatenating big strings.

Line numbers start at 1. Character positions are counted from zero,
and count each line break and UTF-16 code unit as one unit.

class Text implements Iterable `<`string `>`The data structure for documents.

length `:`number The length of the string.

lines `:`number The number of lines in the string (always >= 1).

lineAt `(`pos `:`number `) →`Line Get the line description around the given position.

line `(`n `:`number `) →`Line Get the description for the given (1-based) line number.

replace `(`from `:`number `,`to `:`number `,`text `:`Text `) →`Text Replace a range of the text with the given content.

append `(`other `:`Text `) →`Text Append another document to this one.

slice `(`from `:`number `,`to `⁠?:`number = this.length `) →`Text Retrieve the text between the given points.

sliceString `(`from `:`number `,`to `⁠?:`number `,`lineSep `⁠?:`string `) →`string Retrieve a part of the document as a string

eq `(`other `:`Text `) →`boolean Test whether this text is equal to another instance.

iter `(`dir `⁠?:`1 `|`-1 = 1 `) →`TextIterator Iterate over the text. When

`dir`is

`-1`, iteration happens
from end to start. This will return lines and the breaks between
them as separate strings.

iterRange `(`from `:`number `,`to `⁠?:`number = this.length `) →`TextIterator Iterate over a range of the text. When

`from`>

`to`, the
iterator will run in reverse.

iterLines `(`from `⁠?:`number `,`to `⁠?:`number `) →`TextIterator Return a cursor that iterates over the given range of lines,

without returning the line breaks between, and yielding empty
strings for empty lines.

When

`from`and

`to`are given, they should be 1-based line numbers.

toString `() →`string Return the document as a string, using newline characters to
separate lines.

toJSON `() →`string `[]`Convert the document to an array of lines (which can be
deserialized again via

`Text.of`).

children `:`readonly Text `[] |`null If this is a branch node,

`children`will hold the

`Text`objects that it is made up of. For leaf nodes, this holds null.

[symbol iterator] `() →`Iterator `<`string `>`@hide

static of `(`text `:`readonly string `[]) →`Text Create a

`Text`instance for the given array of lines.

static empty `:`Text The empty document.

class Line This type describes a line in the document. It is created
on-demand when lines are

queried .

from `:`number The position of the start of the line.

to `:`number The position at the end of the line (

before the line break,
or at the end of document for the last line).

number `:`number This line's line number (1-based).

text `:`string The line's content.

length `:`number The length of the line (not including any line break after it).

interface TextIterator extends Iterator `<`string `>`extends Iterable `<`string `>`A text iterator iterates over a sequence of strings. When
iterating over a

`Text`document, result values will
either be lines or line breaks.

next `(`skip `⁠?:`number `) →`TextIterator Retrieve the next string. Optionally skip a given number of
positions after the current position. Always returns the object
itself.

value `:`string The current string. Will be the empty string when the cursor is
at its end or

`next`hasn't been called on it yet.

done `:`boolean Whether the end of the iteration has been reached. You should
probably check this right after calling

`next`.

lineBreak `:`boolean Whether the current string represents a line break.

#### Column Utilities

countColumn `(`string : string , tabSize : number , to ⁠?: number = string.length `) →`number Count the column position at the given offset into the string,
taking extending characters and tab size into account.

findColumn `(`string : string , col : number , tabSize : number , strict ⁠?: boolean `) →`number Find the offset that corresponds to the given column position in a
string, taking extending characters and tab size into account. By
default, the string length is returned when it is too short to
reach the column. Pass

`strict`true to make it return -1 in that
situation.

#### Code Points and Characters

If you support environments that don't yet have

`String.fromCodePoint`and

`codePointAt`, this package provides portable replacements for them.

codePointAt `(`str `:`string `,`pos `:`number `) →`number Find the code point at the given position in a string (like the

`codePointAt`string method).

fromCodePoint `(`code `:`number `) →`string Given a Unicode codepoint, return the JavaScript string that
respresents it (like

`String.fromCodePoint`).

codePointSize `(`code `:`number `) →`1 `|`2 The amount of positions a character takes up in a JavaScript string.

findClusterBreak `(`str : string , pos : number , forward ⁠?: boolean = true , includeExtending ⁠?: boolean = true `) →`number Returns a next grapheme cluster break

after (not equal to)

`pos`, if

`forward`is true, or before otherwise. Returns

`pos`itself if no further cluster break is available in the string.
Moves across surrogate pairs, extending characters (when

`includeExtending`is true), characters joined with zero-width
joiners, and flag emoji.

### Changes and Transactions

CodeMirror treats changes to the document as

objects , which are usually part of a

transaction .

This is how you'd make a change to a document (replacing “world” with
“editor”) and create a new state with the updated document:

let state = EditorState . create ( { doc : "hello world" } ) let transaction = state . update ( { changes : { from : 6 , to : 11 , insert : "editor" } } ) console . log ( transaction . state . doc . toString ( ) ) // "hello editor" interface TransactionSpec Describes a

transaction when calling the

`EditorState.update`method.

changes `⁠?:`ChangeSpec The changes to the document made by this transaction.

selection `⁠?:`EditorSelection `|`{ anchor : number , head ⁠?: number } | undefined When set, this transaction explicitly updates the selection.
Offsets in this selection should refer to the document as it is

after the transaction.

effects `⁠?:`StateEffect `<`any `> |`readonly StateEffect `<`any `>[]`Attach

state effects to this transaction.
Again, when they contain positions and this same spec makes
changes, those positions should refer to positions in the
updated document.

annotations `⁠?:`Annotation `<`any `> |`readonly Annotation `<`any `>[]`Set

annotations for this transaction.

userEvent `⁠?:`string Shorthand for

`annotations:``Transaction.userEvent``.of(...)`.

scrollIntoView `⁠?:`boolean When set to

`true`, the transaction is marked as needing to
scroll the current selection into view.

filter `⁠?:`boolean By default, transactions can be modified by

change
filters and

transaction
filters . You can set this
to

`false`to disable that. This can be necessary for
transactions that, for example, include annotations that must be
kept consistent with their changes.

sequential `⁠?:`boolean Normally, when multiple specs are combined (for example by

`EditorState.update`), the
positions in

`changes`are taken to refer to the document
positions in the initial document. When a spec has

`sequental`set to true, its positions will be taken to refer to the
document created by the specs before it instead.

type ChangeSpec `= {`from `:`number `,`to `⁠?:`number `,`insert `⁠?:`string `|`Text `} |`ChangeSet | readonly ChangeSpec [] This type is used as argument to

`EditorState.changes`and in the

`changes`field of transaction
specs to succinctly describe document changes. It may either be a
plain object describing a change (a deletion, insertion, or
replacement, depending on which fields are present), a

change
set , or an array of change specs.

class Transaction Changes to the editor state are grouped into transactions.
Typically, a user action creates a single transaction, which may
contain any number of document changes, may change the selection,
or have other effects. Create a transaction by calling

`EditorState.update`, or immediately
dispatch one by calling

`EditorView.dispatch`.

startState `:`EditorState The state from which the transaction starts.

changes `:`ChangeSet The document changes made by this transaction.

selection `:`EditorSelection `|`undefined The selection set by this transaction, or undefined if it
doesn't explicitly set a selection.

effects `:`readonly StateEffect `<`any `>[]`The effects added to the transaction.

scrollIntoView `:`boolean Whether the selection should be scrolled into view after this
transaction is dispatched.

newDoc `:`Text The new document produced by the transaction. Contrary to

`.state``.doc`, accessing this won't
force the entire new state to be computed right away, so it is
recommended that

transaction
filters use this getter
when they need to look at the new document.

newSelection `:`EditorSelection The new selection produced by the transaction. If

`this.selection`is undefined,
this will

map the start state's
current selection through the changes made by the transaction.

state `:`EditorState The new state created by the transaction. Computed on demand
(but retained for subsequent access), so it is recommended not to
access it in

transaction
filters when possible.

annotation `<`T `>(`type `:`AnnotationType `<`T `>) →`T `|`undefined Get the value of the given annotation type, if any.

docChanged `:`boolean Indicates whether the transaction changed the document.

reconfigured `:`boolean Indicates whether this transaction reconfigures the state
(through a

configuration compartment or
with a top-level configuration

effect .

isUserEvent `(`event `:`string `) →`boolean Returns true if the transaction has a

user
event annotation that is equal to
or more specific than

`event`. For example, if the transaction
has

`"select.pointer"`as user event,

`"select"`and

`"select.pointer"`will match it.

static time `:`AnnotationType `<`number `>`Annotation used to store transaction timestamps. Automatically
added to every transaction, holding

`Date.now()`.

static userEvent `:`AnnotationType `<`string `>`Annotation used to associate a transaction with a user interface
event. Holds a string identifying the event, using a
dot-separated format to support attaching more specific
information. The events used by the core libraries are:

`"input"`- when content is entered
`"input.type"`- for typed input
`"input.type.compose"`- for composition
`"input.paste"`- for pasted input
`"input.drop"`- when adding content with drag-and-drop
`"input.complete"`- when autocompleting
`"delete"`- when the user deletes content
`"delete.selection"`- when deleting the selection
`"delete.forward"`- when deleting forward from the selection
`"delete.backward"`- when deleting backward from the selection
`"delete.cut"`- when cutting to the clipboard
`"move"`- when content is moved
`"move.drop"`- when content is moved within the editor through drag-and-drop
`"select"`- when explicitly changing the selection
`"select.pointer"`- when selecting with a mouse or other pointing device
`"undo"`- and
`"redo"`- for history actions
Use

`isUserEvent`to check
whether the annotation matches a given event.

static addToHistory `:`AnnotationType `<`boolean `>`Annotation indicating whether a transaction should be added to
the undo history or not.

static remote `:`AnnotationType `<`boolean `>`Annotation indicating (when present and true) that a transaction
represents a change made by some other actor, not the user. This
is used, for example, to tag other people's changes in
collaborative editing.

class ChangeDesc A change description is a variant of

change set that doesn't store the inserted text. As such, it can't be
applied, but is cheaper to store and manipulate.

length `:`number The length of the document before the change.

newLength `:`number The length of the document after the change.

empty `:`boolean False when there are actual changes in this set.

iterGaps `(`f `:`fn `(`posA `:`number `,`posB `:`number `,`length `:`number `))`Iterate over the unchanged parts left by these changes.

`posA`provides the position of the range in the old document,

`posB`the new position in the changed document.

iterChangedRanges `(`f : fn ( fromA : number , toA : number , fromB : number , toB : number ), individual ⁠?: boolean = false `)`Iterate over the ranges changed by these changes. (See

`ChangeSet.iterChanges`for a
variant that also provides you with the inserted text.)

`fromA`/

`toA`provides the extent of the change in the starting
document,

`fromB`/

`toB`the extent of the replacement in the
changed document.

When

`individual`is true, adjacent changes (which are kept
separate for

position mapping ) are
reported separately.

invertedDesc `:`ChangeDesc Get a description of the inverted form of these changes.

composeDesc `(`other `:`ChangeDesc `) →`ChangeDesc Compute the combined effect of applying another set of changes
after this one. The length of the document after this set should
match the length before

`other`.

mapDesc `(`other `:`ChangeDesc `,`before `⁠?:`boolean = false `) →`ChangeDesc Map this description, which should start with the same document
as

`other`, over another set of changes, so that it can be
applied after it. When

`before`is true, map as if the changes
in

`this`happened before the ones in

`other`.

mapPos `(`pos `:`number `,`assoc `⁠?:`number `) →`number mapPos `(`pos `:`number `,`assoc `:`number `,`mode `:`MapMode `) →`number `|`null Map a given position through these changes, to produce a
position pointing into the new document.

`assoc`indicates which side the position should be associated
with. When it is negative or zero, the mapping will try to keep
the position close to the character before it (if any), and will
move it before insertions at that point or replacements across
that point. When it is positive, the position is associated with
the character after it, and will be moved forward for insertions
at or replacements across the position. Defaults to -1.

`mode`determines whether deletions should be

reported . It defaults to

`MapMode.Simple`(don't report
deletions).

touchesRange `(`from `:`number `,`to `⁠?:`number = from `) →`boolean `|`"cover" Check whether these changes touch a given range. When one of the
changes entirely covers the range, the string

`"cover"`is
returned.

toJSON `() →`readonly number `[]`Serialize this change desc to a JSON-representable value.

static fromJSON `(`json `:`any `) →`ChangeDesc Create a change desc from its JSON representation (as produced
by

`toJSON`.

enum MapMode Distinguishes different ways in which positions can be mapped.

Simple Map a position to a valid new position, even when its context
was deleted.

TrackDel Return null if deletion happens across the position.

TrackBefore Return null if the character

before the position is deleted.

TrackAfter Return null if the character

after the position is deleted.

class ChangeSet extends ChangeDesc A change set represents a group of modifications to a document. It
stores the document length, and can only be applied to documents
with exactly that length.

apply `(`doc `:`Text `) →`Text Apply the changes to a document, returning the modified
document.

invert `(`doc `:`Text `) →`ChangeSet Given the document as it existed

before the changes, return a
change set that represents the inverse of this set, which could
be used to go from the document created by the changes back to
the document as it existed before the changes.

compose `(`other `:`ChangeSet `) →`ChangeSet Combine two subsequent change sets into a single set.

`other`must start in the document produced by

`this`. If

`this`goes

`docA`→

`docB`and

`other`represents

`docB`→

`docC`, the
returned value will represent the change

`docA`→

`docC`.

map `(`other `:`ChangeDesc `,`before `⁠?:`boolean = false `) →`ChangeSet Given another change set starting in the same document, maps this
change set over the other, producing a new change set that can be
applied to the document produced by applying

`other`. When

`before`is

`true`, order changes as if

`this`comes before

`other`, otherwise (the default) treat

`other`as coming first.

Given two changes

`A`and

`B`,

`A.compose(B.map(A))`and

`B.compose(A.map(B, true))`will produce the same document. This
provides a basic form of

operational
transformation ,
and can be used for collaborative editing.

iterChanges `(`f : fn ( fromA : number , toA : number , fromB : number , toB : number , inserted : Text ), individual ⁠?: boolean = false `)`Iterate over the changed ranges in the document, calling

`f`for
each, with the range in the original document (

`fromA`-

`toA`)
and the range that replaces it in the new document
(

`fromB`-

`toB`).

When

`individual`is true, adjacent changes are reported
separately.

desc `:`ChangeDesc Get a

change description for this change
set.

toJSON `() →`any Serialize this change set to a JSON-representable value.

static of `(`changes `:`ChangeSpec `,`length `:`number `,`lineSep `⁠?:`string `) →`ChangeSet Create a change set for the given changes, for a document of the
given length, using

`lineSep`as line separator.

static empty `(`length `:`number `) →`ChangeSet Create an empty changeset of the given length.

static fromJSON `(`json `:`any `) →`ChangeSet Create a changeset from its JSON representation (as produced by

`toJSON`.

class Annotation `<`T `>`Annotations are tagged values that are used to add metadata to
transactions in an extensible way. They should be used to model
things that effect the entire transaction (such as its

time
stamp or information about its

origin ). For effects that happen

alongside the other changes made by the transaction,

state
effects are more appropriate.

type `:`AnnotationType `<`T `>`The annotation type.

value `:`T The value of this annotation.

static define `<`T `>() →`AnnotationType `<`T `>`Define a new type of annotation.

class AnnotationType `<`T `>`Marker that identifies a type of

annotation .

of `(`value `:`T `) →`Annotation `<`T `>`Create an instance of this annotation.

class StateEffect `<`Value `>`State effects can be used to represent additional effects
associated with a

transaction . They
are often useful to model changes to custom

state
fields , when those changes aren't implicit in
document or selection changes.

value `:`Value The value of this effect.

map `(`mapping `:`ChangeDesc `) →`StateEffect `<`Value `> |`undefined Map this effect through a position mapping. Will return

`undefined`when that ends up deleting the effect.

is `<`T `>(`type `:`StateEffectType `<`T `>) →`boolean Tells you whether this effect object is of a given

type .

static define `<`Value `= null>(`spec `⁠?:`Object = {} `) →`StateEffectType `<`Value `>`Define a new effect type. The type parameter indicates the type
of values that his effect holds. It should be a type that
doesn't include

`undefined`, since that is used in

mapping to indicate that an effect is
removed.

spec map `⁠?:`fn `(`value `:`Value `,`mapping `:`ChangeDesc `) →`Value `|`undefined Provides a way to map an effect like this through a position
mapping. When not given, the effects will simply not be mapped.
When the function returns

`undefined`, that means the mapping
deletes the effect.

static mapEffects `(`effects : readonly StateEffect < any >[], mapping : ChangeDesc `) →`readonly StateEffect `<`any `>[]`Map an array of effects through a change set.

static reconfigure `:`StateEffectType `<`Extension `>`This effect can be used to reconfigure the root extensions of
the editor. Doing this will discard any extensions

appended , but does not reset
the content of

reconfigured compartments.

static appendConfig `:`StateEffectType `<`Extension `>`Append extensions to the top-level configuration of the editor.

class StateEffectType `<`Value `>`Representation of a type of state effect. Defined with

`StateEffect.define`.

of `(`value `:`Value `) →`StateEffect `<`Value `>`Create a

state effect instance of this
type.

### Extending Editor State

The following are some types and mechanisms used when writing
extensions for the editor state.

type StateCommand `=`fn `(`target : { state : EditorState , dispatch : fn ( transaction : Transaction )} `) →`boolean Subtype of

`Command`that doesn't require access
to the actual editor view. Mostly useful to define commands that
can be run and tested outside of a browser environment.

type Extension `= {`extension `:`Extension `} |`readonly Extension `[]`Extension values can be

provided when creating a
state to attach various kinds of configuration and behavior
information. They can either be built-in extension-providing
objects, such as

state fields or

facet
providers , or objects with an extension in its

`extension`property. Extensions can be nested in arrays
arbitrarily deep—they will be flattened when processed.

class StateField `<`Value `>`Fields can store additional information in an editor state, and
keep it in sync with the rest of the state.

init `(`create `:`fn `(`state `:`EditorState `) →`Value `) →`Extension Returns an extension that enables this field and overrides the
way it is initialized. Can be useful when you need to provide a
non-default starting value for the field.

extension `:`Extension State field instances can be used as

`Extension`values to enable the field in a
given state.

static define `<`Value `>(`config `:`Object `) →`StateField `<`Value `>`Define a state field.

config create `(`state `:`EditorState `) →`Value Creates the initial value for the field when a state is created.

update `(`value `:`Value `,`transaction `:`Transaction `) →`Value Compute a new value from the field's previous value and a

transaction .

compare `⁠?:`fn `(`a `:`Value `,`b `:`Value `) →`boolean Compare two values of the field, returning

`true`when they are
the same. This is used to avoid recomputing facets that depend
on the field when its value did not change. Defaults to using

`===`.

provide `⁠?:`fn `(`field `:`StateField `<`Value `>) →`Extension Provide extensions based on this field. The given function will
be called once with the initialized field. It will usually want
to call some facet's

`from`method to
create facet inputs from this field, but can also return other
extensions that should be enabled when the field is present in a
configuration.

toJSON `⁠?:`fn `(`value `:`Value `,`state `:`EditorState `) →`any A function used to serialize this field's content to JSON. Only
necessary when this field is included in the argument to

`EditorState.toJSON`.

fromJSON `⁠?:`fn `(`json `:`any `,`state `:`EditorState `) →`Value A function that deserializes the JSON representation of this
field's content.

class Facet `<`Input `,`Output `= readonly Input[]>`implements FacetReader `<`Output `>`A facet is a labeled value that is associated with an editor
state. It takes inputs from any number of extensions, and combines
those into a single output value.

Examples of uses of facets are the

tab
size ,

editor
attributes , and

update
listeners .

Note that

`Facet`instances can be used anywhere where

`FacetReader`is expected.

reader `:`FacetReader `<`Output `>`Returns a facet reader for this facet, which can be used to

read it but not to define values for it.

of `(`value `:`Input `) →`Extension Returns an extension that adds the given value to this facet.

compute `(`deps : readonly ( StateField < any > | "doc" | "selection" | FacetReader < any >)[], get : fn ( state : EditorState ) → Input `) →`Extension Create an extension that computes a value for the facet from a
state. You must take care to declare the parts of the state that
this value depends on, since your function is only called again
for a new state when one of those parts changed.

In cases where your value depends only on a single field, you'll
want to use the

`from`method instead.

computeN `(`deps : readonly ( StateField < any > | "doc" | "selection" | FacetReader < any >)[], get : fn ( state : EditorState ) → readonly Input [] `) →`Extension Create an extension that computes zero or more values for this
facet from a state.

from `<`T extends Input `>(`field `:`StateField `<`T `>) →`Extension from `<`T `>(`field `:`StateField `<`T `>,`get `:`fn `(`value `:`T `) →`Input `) →`Extension Shorthand method for registering a facet source with a state
field as input. If the field's type corresponds to this facet's
input type, the getter function can be omitted. If given, it
will be used to retrieve the input from the field value.

static define `<`Input `,`Output `= readonly Input[]>(`config `⁠?:`Object = {} `) →`Facet `<`Input `,`Output `>`Define a new facet.

config combine `⁠?:`fn `(`value `:`readonly Input `[]) →`Output How to combine the input values into a single output value. When
not given, the array of input values becomes the output. This
function will immediately be called on creating the facet, with
an empty array, to compute the facet's default value when no
inputs are present.

compare `⁠?:`fn `(`a `:`Output `,`b `:`Output `) →`boolean How to compare output values to determine whether the value of
the facet changed. Defaults to comparing by

`===`or, if no

`combine`function was given, comparing each element of the
array with

`===`.

compareInput `⁠?:`fn `(`a `:`Input `,`b `:`Input `) →`boolean How to compare input values to avoid recomputing the output
value when no inputs changed. Defaults to comparing with

`===`.

static `⁠?:`boolean Forbids dynamic inputs to this facet.

enables `⁠?:`Extension `|`fn `(`self `:`Facet `<`Input `,`Output `>) →`Extension If given, these extension(s) (or the result of calling the given
function with the facet) will be added to any state where this
facet is provided. (Note that, while a facet's default value can
be read from a state even if the facet wasn't present in the
state at all, these extensions won't be added in that
situation.)

type FacetReader `<`Output `>`A facet reader can be used to fetch the value of a facet, through

`EditorState.facet`or as a dependency
in

`Facet.compute`, but not to define new
values for the facet.

tag `:`Output Dummy tag that makes sure TypeScript doesn't consider all object
types as conforming to this type. Not actually present on the
object.

Prec `:`Object By default extensions are registered in the order they are found
in the flattened form of nested array that was provided.
Individual extension values can be assigned a precedence to
override this. Extensions that do not have a precedence set get
the precedence of the nearest parent with a precedence, or

`default`if there is no such parent. The
final ordering of extensions is determined by first sorting by
precedence and then by order within each precedence.

highest `(`ext `:`Extension `) →`Extension The highest precedence level, for extensions that should end up
near the start of the precedence ordering.

high `(`ext `:`Extension `) →`Extension A higher-than-default precedence, for extensions that should
come before those with default precedence.

default `(`ext `:`Extension `) →`Extension The default precedence, which is also used for extensions
without an explicit precedence.

low `(`ext `:`Extension `) →`Extension A lower-than-default precedence.

lowest `(`ext `:`Extension `) →`Extension The lowest precedence level. Meant for things that should end up
near the end of the extension order.

class Compartment Extension compartments can be used to make a configuration
dynamic. By

wrapping part of your
configuration in a compartment, you can later

replace that part through a
transaction.

of `(`ext `:`Extension `) →`Extension Create an instance of this compartment to add to your

state
configuration .

reconfigure `(`content `:`Extension `) →`StateEffect `<`unknown `>`Create an

effect that
reconfigures this compartment.

get `(`state `:`EditorState `) →`Extension `|`undefined Get the current content of the compartment in the state, or

`undefined`if it isn't present.

### Range Sets

Range sets provide a data structure that can hold a collection of
tagged, possibly overlapping

ranges in such a way
that they can efficiently be

mapped though
document changes. They are used for storing things like

decorations or

gutter
markers .

abstract class RangeValue Each range is associated with a value, which must inherit from
this class.

eq `(`other `:`RangeValue `) →`boolean Compare this value with another value. Used when comparing
rangesets. The default implementation compares by identity.
Unless you are only creating a fixed number of unique instances
of your value type, it is a good idea to implement this
properly.

startSide `:`number The bias value at the start of the range. Determines how the
range is positioned relative to other ranges starting at this
position. Defaults to 0.

endSide `:`number The bias value at the end of the range. Defaults to 0.

mapMode `:`MapMode The mode with which the location of the range should be mapped
when its

`from`and

`to`are the same, to decide whether a
change deletes the range. Defaults to

`MapMode.TrackDel`.

point `:`boolean Determines whether this value marks a point range. Regular
ranges affect the part of the document they cover, and are
meaningless when empty. Point ranges have a meaning on their
own. When non-empty, a point range is treated as atomic and
shadows any ranges contained in it.

range `(`from `:`number `,`to `⁠?:`number = from `) →`Range `<`RangeValue `>`Create a

range with this value.

class Range `<`T extends RangeValue `>`A range associates a value with a range of positions.

from `:`number The range's start position.

to `:`number Its end position.

value `:`T The value associated with this range.

class RangeSet `<`T extends RangeValue `>`A range set stores a collection of

ranges in a
way that makes them efficient to

map and

update . This is an immutable data
structure.

size `:`number The number of ranges in the set.

update `<`U extends T `>(`updateSpec `:`Object `) →`RangeSet `<`T `>`Update the range set, optionally adding new ranges or filtering
out existing ones.

(Note: The type parameter is just there as a kludge to work
around TypeScript variance issues that prevented

`RangeSet<X>`from being a subtype of

`RangeSet<Y>`when

`X`is a subtype of

`Y`.)

updateSpec add `⁠?:`readonly Range `<`U `>[]`An array of ranges to add. If given, this should be sorted by

`from`position and

`startSide`unless

`sort`is given as

`true`.

sort `⁠?:`boolean Indicates whether the library should sort the ranges in

`add`.
Defaults to

`false`.

filter `⁠?:`fn `(`from `:`number `,`to `:`number `,`value `:`U `) →`boolean Filter the ranges already in the set. Only those for which this
function returns

`true`are kept.

filterFrom `⁠?:`number Can be used to limit the range on which the filter is
applied. Filtering only a small range, as opposed to the entire
set, can make updates cheaper.

filterTo `⁠?:`number The end position to apply the filter to.

map `(`changes `:`ChangeDesc `) →`RangeSet `<`T `>`Map this range set through a set of changes, return the new set.

between `(`from : number , to : number , f : fn ( from : number , to : number , value : T ) → false | undefined `)`Iterate over the ranges that touch the region

`from`to

`to`,
calling

`f`for each. There is no guarantee that the ranges will
be reported in any specific order. When the callback returns

`false`, iteration stops.

iter `(`from `⁠?:`number = 0 `) →`RangeCursor `<`T `>`Iterate over the ranges in this set, in order, including all
ranges that end at or after

`from`.

static iter `<`T extends RangeValue `>(`sets `:`readonly RangeSet `<`T `>[],`from `⁠?:`number = 0 `) →`RangeCursor `<`T `>`Iterate over the ranges in a collection of sets, in order,
starting from

`from`.

static compare `<`T extends RangeValue `>(`oldSets : readonly RangeSet < T >[], newSets : readonly RangeSet < T >[], textDiff : ChangeDesc , comparator : RangeComparator < T >, minPointSize ⁠?: number = -1 `)`Iterate over two groups of sets, calling methods on

`comparator`to notify it of possible differences.

textDiff This indicates how the underlying data changed between these
ranges, and is needed to synchronize the iteration.

minPointSize Can be used to ignore all non-point ranges, and points below
the given size. When -1, all ranges are compared.

static eq `<`T extends RangeValue `>(`oldSets : readonly RangeSet < T >[], newSets : readonly RangeSet < T >[], from ⁠?: number = 0 , to ⁠?: number `) →`boolean Compare the contents of two groups of range sets, returning true
if they are equivalent in the given range.

static spans `<`T extends RangeValue `>(`sets : readonly RangeSet < T >[], from : number , to : number , iterator : SpanIterator < T >, minPointSize ⁠?: number = -1 `) →`number Iterate over a group of range sets at the same time, notifying
the iterator about the ranges covering every given piece of
content. Returns the open count (see

`SpanIterator.span`) at the end
of the iteration.

minPointSize When given and greater than -1, only points of at least this
size are taken into account.

static of `<`T extends RangeValue `>(`ranges : readonly Range < T >[] | Range < T >, sort ⁠?: boolean = false `) →`RangeSet `<`T `>`Create a range set for the given range or array of ranges. By
default, this expects the ranges to be

sorted (by start
position and, if two start at the same position,

`value.startSide`). You can pass

`true`as second argument to
cause the method to sort them.

static join `<`T extends RangeValue `>(`sets `:`readonly RangeSet `<`T `>[]) →`RangeSet `<`T `>`Join an array of range sets into a single set.

static empty `:`RangeSet `<`any `>`The empty set of ranges.

interface RangeCursor `<`T `>`A range cursor is an object that moves to the next range every
time you call

`next`on it. Note that, unlike ES6 iterators, these
start out pointing at the first element, so you should call

`next`only after reading the first range (if any).

next `()`Move the iterator forward.

value `:`T `|`null The next range's value. Holds

`null`when the cursor has reached
its end.

from `:`number The next range's start position.

to `:`number The next end position.

class RangeSetBuilder `<`T extends RangeValue `>`A range set builder is a data structure that helps build up a

range set directly, without first allocating
an array of

`Range`objects.

new RangeSetBuilder `()`Create an empty builder.

add `(`from `:`number `,`to `:`number `,`value `:`T `)`Add a range. Ranges should be added in sorted (by

`from`and

`value.startSide`) order.

finish `() →`RangeSet `<`T `>`Finish the range set. Returns the new set. The builder can't be
used anymore after this has been called.

interface RangeComparator `<`T extends RangeValue `>`Collection of methods used when comparing range sets.

compareRange `(`from : number , to : number , activeA : T [], activeB : T [] `)`Notifies the comparator that a range (in positions in the new
document) has the given sets of values associated with it, which
are different in the old (A) and new (B) sets.

comparePoint `(`from : number , to : number , pointA : T | null , pointB : T | null `)`Notification for a changed (or inserted, or deleted) point range.

boundChange `⁠?:`fn `(`pos `:`number `)`Notification for a changed boundary between ranges. For example,
if the same span is covered by two partial ranges before and one
bigger range after, this is called at the point where the ranges
used to be split.

interface SpanIterator `<`T extends RangeValue `>`Methods used when iterating over the spans created by a set of
ranges. The entire iterated range will be covered with either

`span`or

`point`calls.

span `(`from : number , to : number , active : readonly T [], openStart : number `)`Called for any ranges not covered by point decorations.

`active`holds the values that the range is marked with (and may be
empty).

`openStart`indicates how many of those ranges are open
(continued) at the start of the span.

point `(`from : number , to : number , value : T , active : readonly T [], openStart : number , index : number `)`Called when going over a point decoration. The active range
decorations that cover the point and have a higher precedence
are provided in

`active`. The open count in

`openStart`counts
the number of those ranges that started before the point and. If
the point started before the iterated range,

`openStart`will be

`active.length + 1`to signal this.

### Utilities

combineConfig `<`Config extends object `>(`configs : readonly Partial < Config >[], defaults : Partial < Config >, combine ⁠?: { [ P in keyof Config ]: fn ( first : Config [ P ], second : Config [ P ]) → Config [ P ] } = {} `) →`Config Utility function for combining behaviors to fill in a config
object from an array of provided configs.

`defaults`should hold
default values for all optional fields in

`Config`.

The function will, by default, error
when a field gets two values that aren't

`===`-equal, but you can
provide combine functions per field to do something else.

@codemirror/ view The “view” is the part of the editor that the user sees—a DOM
component that displays the editor state and allows text input.

interface EditorViewConfig extends EditorStateConfig The type of object given to the

`EditorView`constructor.

state `⁠?:`EditorState The view's initial state. If not given, a new state is created
by passing this configuration object to

`EditorState.create`, using its

`doc`,

`selection`, and

`extensions`field (if provided).

parent `⁠?:`Element `|`DocumentFragment When given, the editor is immediately appended to the given
element on creation. (Otherwise, you'll have to place the view's

`dom`element in the document yourself.)

root `⁠?:`Document `|`ShadowRoot If the view is going to be mounted in a shadow root or document
other than the one held by the global variable

`document`(the
default), you should pass it here. If you provide

`parent`, but
not this option, the editor will automatically look up a root
from the parent.

scrollTo `⁠?:`StateEffect `<`any `>`Pass an effect created with

`EditorView.scrollIntoView`or

`EditorView.scrollSnapshot`here to set an initial scroll position.

dispatchTransactions `⁠?:`fn `(`trs `:`readonly Transaction `[],`view `:`EditorView `)`Override the way transactions are

dispatched for this editor view.
Your implementation, if provided, should probably call the
view's

`update`method .

dispatch `⁠?:`fn `(`tr `:`Transaction `,`view `:`EditorView `)`Deprecated single-transaction version of

`dispatchTransactions`. Will force transactions to be dispatched
one at a time when used.

class EditorView An editor view represents the editor's user interface. It holds
the editable DOM surface, and possibly other elements such as the
line number gutter. It handles events and dispatches state
transactions for editing actions.

new EditorView `(`config `⁠?:`EditorViewConfig = {} `)`Construct a new view. You'll want to either provide a

`parent`option, or put

`view.dom`into your document after creating a
view, so that the user can see the editor.

state `:`EditorState The current editor state.

viewport `: {`from `:`number `,`to `:`number `}`To be able to display large documents without consuming too much
memory or overloading the browser, CodeMirror only draws the
code that is visible (plus a margin around it) to the DOM. This
property tells you the extent of the current drawn viewport, in
document positions.

visibleRanges `:`readonly `{`from `:`number `,`to `:`number `}[]`When there are, for example, large collapsed ranges in the
viewport, its size can be a lot bigger than the actual visible
content. Thus, if you are doing something like styling the
content in the viewport, it is preferable to only do so for
these ranges, which are the subset of the viewport that is
actually drawn.

inView `:`boolean Returns false when the editor is entirely scrolled out of view
or otherwise hidden.

composing `:`boolean Indicates whether the user is currently composing text via

IME , and at least
one change has been made in the current composition.

compositionStarted `:`boolean Indicates whether the user is currently in composing state. Note
that on some platforms, like Android, this will be the case a
lot, since just putting the cursor on a word starts a
composition there.

root `:`DocumentOrShadowRoot The document or shadow root that the view lives in.

dom `:`HTMLElement The DOM element that wraps the entire editor view.

scrollDOM `:`HTMLElement The DOM element that can be styled to scroll. (Note that it may
not have been, so you can't assume this is scrollable.)

contentDOM `:`HTMLElement The editable DOM element holding the editor content. You should
not, usually, interact with this content directly though the
DOM, since the editor will immediately undo most of the changes
you make. Instead,

dispatch transactions to modify content, and

decorations to style it.

dispatch `(`tr `:`Transaction `)`dispatch `(`trs `:`readonly Transaction `[])`dispatch `(...`specs `:`TransactionSpec `[])`All regular editor state updates should go through this. It
takes a transaction, array of transactions, or transaction spec
and updates the view to show the new state produced by that
transaction. Its implementation can be overridden with an

option .
This function is bound to the view instance, so it does not have
to be called as a method.

Note that when multiple

`TransactionSpec`arguments are
provided, these define a single transaction (the specs will be
merged), not a sequence of transactions.

update `(`transactions `:`readonly Transaction `[])`Update the view for the given array of transactions. This will
update the visible document and selection to match the state
produced by the transactions, and notify view plugins of the
change. You should usually call

`dispatch`instead, which uses this
as a primitive.

setState `(`newState `:`EditorState `)`Reset the view to the given state. (This will cause the entire
document to be redrawn and all view plugins to be reinitialized,
so you should probably only use it when the new state isn't
derived from the old state. Otherwise, use

`dispatch`instead.)

themeClasses `:`string Get the CSS classes for the currently active editor themes.

requestMeasure `<`T `>(`request `⁠?:`Object `)`Schedule a layout measurement, optionally providing callbacks to
do custom DOM measuring followed by a DOM write phase. Using
this is preferable reading DOM layout directly from, for
example, an event handler, because it'll make sure measuring and
drawing done by other components is synchronized, avoiding
unnecessary DOM layout computations.

request read `(`view `:`EditorView `) →`T Called in a DOM read phase to gather information that requires
DOM layout. Should

not mutate the document.

write `⁠?:`fn `(`measure `:`T `,`view `:`EditorView `)`Called in a DOM write phase to update the document. Should

not do anything that triggers DOM layout.

key `⁠?:`any When multiple requests with the same key are scheduled, only the
last one will actually be run.

plugin `<`T extends PluginValue `>(`plugin `:`ViewPlugin `<`T `>) →`T `|`null Get the value of a specific plugin, if present. Note that
plugins that crash can be dropped from a view, so even when you
know you registered a given plugin, it is recommended to check
the return value of this method.

documentTop `:`number The top position of the document, in screen coordinates. This
may be negative when the editor is scrolled down. Points
directly to the top of the first line, not above the padding.

documentPadding `: {`top `:`number `,`bottom `:`number `}`Reports the padding above and below the document.

scaleX `:`number If the editor is transformed with CSS, this provides the scale
along the X axis. Otherwise, it will just be 1. Note that
transforms other than translation and scaling are not supported.

scaleY `:`number Provide the CSS transformed scale along the Y axis.

elementAtHeight `(`height `:`number `) →`BlockInfo Find the text line or block widget at the given vertical
position (which is interpreted as relative to the

top of the
document ).

lineBlockAtHeight `(`height `:`number `) →`BlockInfo Find the line block (see

`lineBlockAt`at the given
height, again interpreted relative to the

top of the
document .

viewportLineBlocks `:`BlockInfo `[]`Get the extent and vertical position of all

line
blocks in the viewport. Positions
are relative to the

top of the
document ;

lineBlockAt `(`pos `:`number `) →`BlockInfo Find the line block around the given document position. A line
block is a range delimited on both sides by either a
non-

hidden line break, or the
start/end of the document. It will usually just hold a line of
text, but may be broken into multiple textblocks by block
widgets.

contentHeight `:`number The editor's total content height.

moveByChar `(`start : SelectionRange , forward : boolean , by ⁠?: fn ( initial : string ) → fn ( next : string ) → boolean `) →`SelectionRange Move a cursor position by

grapheme
cluster .

`forward`determines whether
the motion is away from the line start, or towards it. In
bidirectional text, the line is traversed in visual order, using
the editor's

text direction .
When the start position was the last one on the line, the
returned position will be across the line break. If there is no
further line, the original position is returned.

By default, this method moves over a single cluster. The
optional

`by`argument can be used to move across more. It will
be called with the first cluster as argument, and should return
a predicate that determines, for each subsequent cluster,
whether it should also be moved over.

moveByGroup `(`start `:`SelectionRange `,`forward `:`boolean `) →`SelectionRange Move a cursor position across the next group of either

letters or non-letter
non-whitespace characters.

visualLineSide `(`line `:`Line `,`end `:`boolean `) →`SelectionRange Get the cursor position visually at the start or end of a line.
Note that this may differ from the

logical position at its
start or end (which is simply at

`line.from`/

`line.to`) if text
at the start or end goes against the line's base text direction.

moveToLineBoundary `(`start : SelectionRange , forward : boolean , includeWrap ⁠?: boolean = true `) →`SelectionRange Move to the next line boundary in the given direction. If

`includeWrap`is true, line wrapping is on, and there is a
further wrap point on the current line, the wrap point will be
returned. Otherwise this function will return the start or end
of the line.

moveVertically `(`start : SelectionRange , forward : boolean , distance ⁠?: number `) →`SelectionRange Move a cursor position vertically. When

`distance`isn't given,
it defaults to moving to the next line (including wrapped
lines). Otherwise,

`distance`should provide a positive distance
in pixels.

When

`start`has a

`goalColumn`, the vertical
motion will use that as a target horizontal position. Otherwise,
the cursor's own horizontal position is used. The returned
cursor will have its goal column set to whichever column was
used.

domAtPos `(`pos `:`number `) → {`node `:`Node `,`offset `:`number `}`Find the DOM parent node and offset (child offset if

`node`is
an element, character offset when it is a text node) at the
given document position.

Note that for positions that aren't currently in

`visibleRanges`, the resulting DOM position isn't necessarily
meaningful (it may just point before or after a placeholder
element).

posAtDOM `(`node `:`Node `,`offset `⁠?:`number = 0 `) →`number Find the document position at the given DOM node. Can be useful
for associating positions with DOM events. Will raise an error
when

`node`isn't part of the editor content.

posAtCoords `(`coords `: {`x `:`number `,`y `:`number `},`precise `:`false `) →`number posAtCoords `(`coords `: {`x `:`number `,`y `:`number `}) →`number `|`null Get the document position at the given screen coordinates. For
positions not covered by the visible viewport's DOM structure,
this will return null, unless

`false`is passed as second
argument, in which case it'll return an estimated position that
would be near the coordinates if it were rendered.

coordsAtPos `(`pos `:`number `,`side `⁠?:`-1 `|`1 = 1 `) →`Rect `|`null Get the screen coordinates at the given document position.

`side`determines whether the coordinates are based on the
element before (-1) or after (1) the position (if no element is
available on the given side, the method will transparently use
another strategy to get reasonable coordinates).

coordsForChar `(`pos `:`number `) →`Rect `|`null Return the rectangle around a given character. If

`pos`does not
point in front of a character that is in the viewport and
rendered (i.e. not replaced, not a line break), this will return
null. For space characters that are a line wrap point, this will
return the position before the line break.

defaultCharacterWidth `:`number The default width of a character in the editor. May not
accurately reflect the width of all characters (given variable
width fonts or styling of invididual ranges).

defaultLineHeight `:`number The default height of a line in the editor. May not be accurate
for all lines.

textDirection `:`Direction The text direction
(

`direction`CSS property) of the editor's content element.

textDirectionAt `(`pos `:`number `) →`Direction Find the text direction of the block at the given position, as
assigned by CSS. If

`perLineTextDirection`isn't enabled, or the given position is outside of the viewport,
this will always return the same as

`textDirection`. Note that
this may trigger a DOM layout.

lineWrapping `:`boolean Whether this editor

wraps lines (as determined by the

`white-space`CSS property of its content element).

bidiSpans `(`line `:`Line `) →`readonly BidiSpan `[]`Returns the bidirectional text structure of the given line
(which should be in the current document) as an array of span
objects. The order of these spans matches the

text
direction —if that is
left-to-right, the leftmost spans come first, otherwise the
rightmost spans come first.

hasFocus `:`boolean Check whether the editor has focus.

focus `()`Put focus on the editor.

setRoot `(`root `:`Document `|`ShadowRoot `)`Update the

root in which the editor lives. This is only
necessary when moving the editor's existing DOM to a new window or shadow root.

destroy `()`Clean up this editor view, removing its element from the
document, unregistering event handlers, and notifying
plugins. The view instance can no longer be used after
calling this.

scrollSnapshot `() →`StateEffect `<`{ range : SelectionRange , y : "nearest" | "start" | "end" | "center" , x : "nearest" | "start" | "end" | "center" , yMargin : number , xMargin : number , isSnapshot : boolean , map : fn ( changes : ChangeDesc ) → Object , clip : fn ( state : EditorState ) → Object } `>`Return an effect that resets the editor to its current (at the
time this method was called) scroll position. Note that this
only affects the editor's own scrollable element, not parents.
See also

`EditorViewConfig.scrollTo`.

The effect should be used with a document identical to the one
it was created for. Failing to do so is not an error, but may
not scroll to the expected position. You can

map the effect to account for changes.

setTabFocusMode `(`to `⁠?:`boolean `|`number `)`Enable or disable tab-focus mode, which disables key bindings
for Tab and Shift-Tab, letting the browser's default
focus-changing behavior go through instead. This is useful to
prevent trapping keyboard users in your editor.

Without argument, this toggles the mode. With a boolean, it
enables (true) or disables it (false). Given a number, it
temporarily enables the mode until that number of milliseconds
have passed or another non-Tab key is pressed.

static scrollIntoView `(`pos `:`number `|`SelectionRange `,`options `⁠?:`Object = {} `) →`StateEffect `<`unknown `>`Returns an effect that can be

added to a transaction to
cause it to scroll the given position or range into view.

options y `⁠?:`"nearest" `|`"start" `|`"end" `|`"center" By default (

`"nearest"`) the position will be vertically
scrolled only the minimal amount required to move the given
position into view. You can set this to

`"start"`to move it
to the top of the view,

`"end"`to move it to the bottom, or

`"center"`to move it to the center.

x `⁠?:`"nearest" `|`"start" `|`"end" `|`"center" Effect similar to

`y`, but for the
horizontal scroll position.

yMargin `⁠?:`number Extra vertical distance to add when moving something into
view. Not used with the

`"center"`strategy. Defaults to 5.
Must be less than the height of the editor.

xMargin `⁠?:`number Extra horizontal distance to add. Not used with the

`"center"`strategy. Defaults to 5. Must be less than the width of the
editor.

static styleModule `:`Facet `<`StyleModule `>`Facet to add a

style
module to
an editor view. The view will ensure that the module is
mounted in its

document
root .

static domEventHandlers `(`handlers `:`DOMEventHandlers `<`any `>) →`Extension Returns an extension that can be used to add DOM event handlers.
The value should be an object mapping event names to handler
functions. For any given event, such functions are ordered by
extension precedence, and the first handler to return true will
be assumed to have handled that event, and no other handlers or
built-in behavior will be activated for it. These are registered
on the

content element , except
for

`scroll`handlers, which will be called any time the
editor's

scroll element or one of
its parent nodes is scrolled.

static domEventObservers `(`observers `:`DOMEventHandlers `<`any `>) →`Extension Create an extension that registers DOM event observers. Contrary
to event

handlers ,
observers can't be prevented from running by a higher-precedence
handler returning true. They also don't prevent other handlers
and observers from running when they return true, and should not
call

`preventDefault`.

static inputHandler `:`Facet `<`fn ( view : EditorView , from : number , to : number , text : string , insert : fn () → Transaction ) → boolean `>`An input handler can override the way changes to the editable
DOM content are handled. Handlers are passed the document
positions between which the change was found, and the new
content. When one returns true, no further input handlers are
called and the default behavior is prevented.

The

`insert`argument can be used to get the default transaction
that would be applied for this input. This can be useful when
dispatching the custom behavior as a separate transaction.

static clipboardInputFilter `:`Facet `<`fn `(`text `:`string `,`state `:`EditorState `) →`string `>`Functions provided in this facet will be used to transform text
pasted or dropped into the editor.

static clipboardOutputFilter `:`Facet `<`fn `(`text `:`string `,`state `:`EditorState `) →`string `>`Transform text copied or dragged from the editor.

static scrollHandler `:`Facet `<`fn ( view : EditorView , range : SelectionRange , options : { x : "nearest" | "start" | "end" | "center" , y : "nearest" | "start" | "end" | "center" , xMargin : number , yMargin : number } ) → boolean `>`Scroll handlers can override how things are scrolled into view.
If they return

`true`, no further handling happens for the
scrolling. If they return false, the default scroll behavior is
applied. Scroll handlers should never initiate editor updates.

static focusChangeEffect `:`Facet `<`fn ( state : EditorState , focusing : boolean ) → StateEffect < any > | null `>`This facet can be used to provide functions that create effects
to be dispatched when the editor's focus state changes.

static perLineTextDirection `:`Facet `<`boolean `,`boolean `>`By default, the editor assumes all its content has the same

text direction . Configure this with a

`true`value to make it read the text direction of every (rendered)
line separately.

static exceptionSink `:`Facet `<`fn `(`exception `:`any `)>`Allows you to provide a function that should be called when the
library catches an exception from an extension (mostly from view
plugins, but may be used by other extensions to route exceptions
from user-code-provided callbacks). This is mostly useful for
debugging and logging. See

`logException`.

static updateListener `:`Facet `<`fn `(`update `:`ViewUpdate `)>`A facet that can be used to register a function to be called
every time the view updates.

static editable `:`Facet `<`boolean `,`boolean `>`Facet that controls whether the editor content DOM is editable.
When its highest-precedence value is

`false`, the element will
not have its

`contenteditable`attribute set. (Note that this
doesn't affect API calls that change the editor content, even
when those are bound to keys or buttons. See the

`readOnly`facet for that.)

static mouseSelectionStyle `:`Facet `<`fn ( view : EditorView , event : MouseEvent ) → MouseSelectionStyle | null `>`Allows you to influence the way mouse selection happens. The
functions in this facet will be called for a

`mousedown`event
on the editor, and can return an object that overrides the way a
selection is computed from that mouse click or drag.

static dragMovesSelection `:`Facet `<`fn `(`event `:`MouseEvent `) →`boolean `>`Facet used to configure whether a given selection drag event
should move or copy the selection. The given predicate will be
called with the

`mousedown`event, and can return

`true`when
the drag should move the content.

static clickAddsSelectionRange `:`Facet `<`fn `(`event `:`MouseEvent `) →`boolean `>`Facet used to configure whether a given selecting click adds a
new range to the existing selection or replaces it entirely. The
default behavior is to check

`event.metaKey`on macOS, and

`event.ctrlKey`elsewhere.

static decorations `:`Facet `<`DecorationSet `|`fn `(`view `:`EditorView `) →`DecorationSet `>`A facet that determines which

decorations are shown in the view. Decorations can be provided in two
ways—directly, or via a function that takes an editor view.

Only decoration sets provided directly are allowed to influence
the editor's vertical layout structure. The ones provided as
functions are called

after the new viewport has been computed,
and thus

must not introduce block widgets or replacing
decorations that cover line breaks.

If you want decorated ranges to behave like atomic units for
cursor motion and deletion purposes, also provide the range set
containing the decorations to

`EditorView.atomicRanges`.

static outerDecorations `:`Facet `<`DecorationSet `|`fn `(`view `:`EditorView `) →`DecorationSet `>`Facet that works much like

`decorations`, but puts its
inputs at the very bottom of the precedence stack, meaning mark
decorations provided here will only be split by other, partially
overlapping `outerDecorations` ranges, and wrap around all
regular decorations. Use this for mark elements that should, as
much as possible, remain in one piece.

static atomicRanges `:`Facet `<`fn `(`view `:`EditorView `) →`RangeSet `<`any `>>`Used to provide ranges that should be treated as atoms as far as
cursor motion is concerned. This causes methods like

`moveByChar`and

`moveVertically`(and the
commands built on top of them) to skip across such regions when
a selection endpoint would enter them. This does

not prevent
direct programmatic

selection
updates from moving into such
regions.

static bidiIsolatedRanges `:`Facet `<`DecorationSet `|`fn `(`view `:`EditorView `) →`DecorationSet `>`When range decorations add a

`unicode-bidi: isolate`style, they
should also include a

`bidiIsolate`property
in their decoration spec, and be exposed through this facet, so
that the editor can compute the proper text order. (Other values
for

`unicode-bidi`, except of course

`normal`, are not
supported.)

static scrollMargins `:`Facet `<`fn `(`view `:`EditorView `) →`Partial `<`Rect `> |`null `>`Facet that allows extensions to provide additional scroll
margins (space around the sides of the scrolling element that
should be considered invisible). This can be useful when the
plugin introduces elements that cover part of that element (for
example a horizontally fixed gutter).

static theme `(`spec `:`Object `<`StyleSpec `>,`options `⁠?: {`dark `⁠?:`boolean `}) →`Extension Create a theme extension. The first argument can be a

`style-mod`style spec providing the styles for the theme. These will be
prefixed with a generated class for the style.

Because the selectors will be prefixed with a scope class, rule
that directly match the editor's

wrapper
element —to which the scope class will be
added—need to be explicitly differentiated by adding an

`&`to
the selector for that element—for example

`&.cm-focused`.

When

`dark`is set to true, the theme will be marked as dark,
which will cause the

`&dark`rules from

base
themes to be used (as opposed to

`&light`when a light theme is active).

static darkTheme `:`Facet `<`boolean `,`boolean `>`This facet records whether a dark theme is active. The extension
returned by

`theme`automatically
includes an instance of this when the

`dark`option is set to
true.

static baseTheme `(`spec `:`Object `<`StyleSpec `>) →`Extension Create an extension that adds styles to the base theme. Like
with

`theme`, use

`&`to indicate the
place of the editor wrapper element when directly targeting
that. You can also use

`&dark`or

`&light`instead to only
target editors with a dark or light theme.

static cspNonce `:`Facet `<`string `,`string `>`Provides a Content Security Policy nonce to use when creating
the style sheets for the editor. Holds the empty string when no
nonce has been provided.

static contentAttributes `:`Facet `<`Object < string > | fn ( view : EditorView ) → Object < string > | null `>`Facet that provides additional DOM attributes for the editor's
editable DOM element.

static editorAttributes `:`Facet `<`Object < string > | fn ( view : EditorView ) → Object < string > | null `>`Facet that provides DOM attributes for the editor's outer
element.

static lineWrapping `:`Extension An extension that enables line wrapping in the editor (by
setting CSS

`white-space`to

`pre-wrap`in the content).

static announce `:`StateEffectType `<`string `>`State effect used to include screen reader announcements in a
transaction. These will be added to the DOM in a visually hidden
element with

`aria-live="polite"`set, and should be used to
describe effects that are visually obvious but may not be
noticed by screen reader users (such as moving to the next
search match).

static findFromDOM `(`dom `:`HTMLElement `) →`EditorView `|`null Retrieve an editor view instance from the view's DOM
representation.

enum Direction Used to indicate

text direction .

LTR Left-to-right.

RTL Right-to-left.

class BlockInfo Record used to represent information about a block-level element
in the editor view.

from `:`number The start of the element in the document.

length `:`number The length of the element.

top `:`number The top position of the element (relative to the top of the
document).

height `:`number Its height.

type `:`BlockType `|`readonly BlockInfo `[]`The type of element this is. When querying lines, this may be
an array of all the blocks that make up the line.

to `:`number The end of the element as a document position.

bottom `:`number The bottom position of the element.

widget `:`WidgetType `|`null If this is a widget block, this will return the widget
associated with it.

widgetLineBreaks `:`number If this is a textblock, this holds the number of line breaks
that appear in widgets inside the block.

enum BlockType The different types of blocks that can occur in an editor view.

Text A line of text.

WidgetBefore A block widget associated with the position after it.

WidgetAfter A block widget associated with the position before it.

WidgetRange A block widget

replacing a range of content.

class BidiSpan Represents a contiguous range of text that has a single direction
(as in left-to-right or right-to-left).

dir `:`Direction The direction of this span.

from `:`number The start of the span (relative to the start of the line).

to `:`number The end of the span.

level `:`number The

"bidi
level" of the span (in this context, 0 means
left-to-right, 1 means right-to-left, 2 means left-to-right
number inside right-to-left text).

type DOMEventHandlers `<`This `> = {`[ event in keyof DOMEventMap ]: fn ( event : DOMEventMap [ event ], view : EditorView ) → boolean | undefined `}`Event handlers are specified with objects like this. For event
types known by TypeScript, this will infer the event argument type
to hold the appropriate event object type. For unknown events, it
is inferred to

`any`, and should be explicitly set if you want type
checking.

interface DOMEventMap extends HTMLElementEventMap Helper type that maps event names to event object types, or the

`any`type for unknown events.

[string] `:`any interface Rect Basic rectangle type.

left `:`number right `:`number top `:`number bottom `:`number ### Extending the View

type Command `=`fn `(`target `:`EditorView `) →`boolean Command functions are used in key bindings and other types of user
actions. Given an editor view, they check whether their effect can
apply to the editor, and if it can, perform it as a side effect
(which usually means

dispatching a
transaction) and return

`true`.

class ViewPlugin `<`V extends PluginValue `>`View plugins associate stateful values with a view. They can
influence the way the content is drawn, and are notified of things
that happen in the view.

extension `:`Extension Instances of this class act as extensions.

static define `<`V extends PluginValue `>(`create `:`fn `(`view `:`EditorView `) →`V `,`spec `⁠?:`PluginSpec `<`V `>) →`ViewPlugin `<`V `>`Define a plugin from a constructor function that creates the
plugin's value, given an editor view.

static fromClass `<`V extends PluginValue `>(`cls `: {`new `(`view `:`EditorView `) →`V `},`spec `⁠?:`PluginSpec `<`V `>) →`ViewPlugin `<`V `>`Create a plugin for a class whose constructor takes a single
editor view as argument.

interface PluginValue extends Object This is the interface plugin objects conform to.

update `⁠?:`fn `(`update `:`ViewUpdate `)`Notifies the plugin of an update that happened in the view. This
is called

before the view updates its own DOM. It is
responsible for updating the plugin's internal state (including
any state that may be read by plugin fields) and

writing to
the DOM for the changes in the update. To avoid unnecessary
layout recomputations, it should

not read the DOM layout—use

`requestMeasure`to schedule
your code in a DOM reading phase if you need to.

docViewUpdate `⁠?:`fn `(`view `:`EditorView `)`Called when the document view is updated (due to content,
decoration, or viewport changes). Should not try to immediately
start another view update. Often useful for calling

`requestMeasure`.

destroy `⁠?:`fn `()`Called when the plugin is no longer going to be used. Should
revert any changes the plugin made to the DOM.

interface PluginSpec `<`V extends PluginValue `>`Provides additional information when defining a

view
plugin .

eventHandlers `⁠?:`DOMEventHandlers `<`V `>`Register the given

event
handlers for the plugin.
When called, these will have their

`this`bound to the plugin
value.

eventObservers `⁠?:`DOMEventHandlers `<`V `>`Registers

event observers for the plugin. Will, when called, have their

`this`bound to
the plugin value.

provide `⁠?:`fn `(`plugin `:`ViewPlugin `<`V `>) →`Extension Specify that the plugin provides additional extensions when
added to an editor configuration.

decorations `⁠?:`fn `(`value `:`V `) →`DecorationSet Allow the plugin to provide decorations. When given, this should
be a function that take the plugin value and return a

decoration set . See also the caveat about

layout-changing decorations that
depend on the view.

class ViewUpdate View

plugins are given instances of this
class, which describe what happened, whenever the view is updated.

changes `:`ChangeSet The changes made to the document by this update.

startState `:`EditorState The previous editor state.

view `:`EditorView The editor view that the update is associated with.

state `:`EditorState The new editor state.

transactions `:`readonly Transaction `[]`The transactions involved in the update. May be empty.

viewportChanged `:`boolean Tells you whether the

viewport or

visible ranges changed in this
update.

viewportMoved `:`boolean Returns true when

`viewportChanged`is true
and the viewport change is not just the result of mapping it in
response to document changes.

heightChanged `:`boolean Indicates whether the height of a block element in the editor
changed in this update.

geometryChanged `:`boolean Returns true when the document was modified or the size of the
editor, or elements within the editor, changed.

focusChanged `:`boolean True when this update indicates a focus change.

docChanged `:`boolean Whether the document changed in this update.

selectionSet `:`boolean Whether the selection was explicitly set in this update.

logException `(`state `:`EditorState `,`exception `:`any `,`context `⁠?:`string `)`Log or report an unhandled exception in client code. Should
probably only be used by extension code that allows client code to
provide functions, and calls those functions in a context where an
exception can't be propagated to calling code in a reasonable way
(for example when in an event handler).

Either calls a handler registered with

`EditorView.exceptionSink`,

`window.onerror`, if defined, or

`console.error`(in which case
it'll pass

`context`, when given, as first argument).

interface MouseSelectionStyle Interface that objects registered with

`EditorView.mouseSelectionStyle`must conform to.

get `(`curEvent : MouseEvent , extend : boolean , multiple : boolean `) →`EditorSelection Return a new selection for the mouse gesture that starts with
the event that was originally given to the constructor, and ends
with the event passed here. In case of a plain click, those may
both be the

`mousedown`event, in case of a drag gesture, the
latest

`mousemove`event will be passed.

When

`extend`is true, that means the new selection should, if
possible, extend the start selection. If

`multiple`is true, the
new selection should be added to the original selection.

update `(`update `:`ViewUpdate `) →`boolean `|`undefined Called when the view is updated while the gesture is in
progress. When the document changes, it may be necessary to map
some data (like the original selection or start position)
through the changes.

This may return

`true`to indicate that the

`get`method should
get queried again after the update, because something in the
update could change its result. Be wary of infinite loops when
using this (where

`get`returns a new selection, which will
trigger

`update`, which schedules another

`get`in response).

drawSelection `(`config `⁠?:`Object = {} `) →`Extension Returns an extension that hides the browser's native selection and
cursor, replacing the selection with a background behind the text
(with the

`cm-selectionBackground`class), and the
cursors with elements overlaid over the code (using

`cm-cursor-primary`and

`cm-cursor-secondary`).

This allows the editor to display secondary selection ranges, and
tends to produce a type of selection more in line with that users
expect in a text editor (the native selection styling will often
leave gaps between lines and won't fill the horizontal space after
a line when the selection continues past it).

It does have a performance cost, in that it requires an extra DOM
layout cycle for many updates (the selection is drawn based on DOM
layout information that's only available after laying out the
content).

config cursorBlinkRate `⁠?:`number The length of a full cursor blink cycle, in milliseconds.
Defaults to 1200. Can be set to 0 to disable blinking.

drawRangeCursor `⁠?:`boolean Whether to show a cursor for non-empty ranges. Defaults to
true.

getDrawSelectionConfig `(`state `:`EditorState `) →`Object Retrieve the

`drawSelection`configuration
for this state. (Note that this will return a set of defaults even
if

`drawSelection`isn't enabled.)

dropCursor `() →`Extension Draws a cursor at the current drop position when something is
dragged over the editor.

highlightActiveLine `() →`Extension Mark lines that have a cursor on them with the

`"cm-activeLine"`DOM class.

highlightSpecialChars `(`config `⁠?:`Object = {} `) →`Extension Returns an extension that installs highlighting of special
characters.

config Configuration options.

render `⁠?:`fn `(`code : number , description : string | null , placeholder : string `) →`HTMLElement An optional function that renders the placeholder elements.

The

`description`argument will be text that clarifies what the
character is, which should be provided to screen readers (for
example with the

`aria-label`attribute) and optionally shown to the user in other ways (such
as the

`title`attribute).

The given placeholder string is a suggestion for how to display
the character visually.

specialChars `⁠?:`RegExp Regular expression that matches the special characters to
highlight. Must have its 'g'/global flag set.

addSpecialChars `⁠?:`RegExp Regular expression that can be used to add characters to the
default set of characters to highlight.

highlightWhitespace `() →`Extension Returns an extension that highlights whitespace, adding a

`cm-highlightSpace`class to stretches of spaces, and a

`cm-highlightTab`class to individual tab characters. By default,
the former are shown as faint dots, and the latter as arrows.

highlightTrailingWhitespace `() →`Extension Returns an extension that adds a

`cm-trailingSpace`class to all
trailing whitespace.

placeholder `(`content : string | HTMLElement | fn ( view : EditorView ) → HTMLElement `) →`Extension Extension that enables a placeholder—a piece of example content
to show when the editor is empty.

scrollPastEnd `() →`Extension Returns an extension that makes sure the content has a bottom
margin equivalent to the height of the editor, minus one line
height, so that every line in the document can be scrolled to the
top of the editor.

This is only meaningful when the editor is scrollable, and should
not be enabled in editors that take the size of their content.

### Key bindings

interface KeyBinding Key bindings associate key names with

command -style functions.

Key names may be strings like

`"Shift-Ctrl-Enter"`—a key identifier
prefixed with zero or more modifiers. Key identifiers are based on
the strings that can appear in

`KeyEvent.key`.
Use lowercase letters to refer to letter keys (or uppercase letters
if you want shift to be held). You may use

`"Space"`as an alias
for the

`" "`name.

Modifiers can be given in any order.

`Shift-`(or

`s-`),

`Alt-`(or

`a-`),

`Ctrl-`(or

`c-`or

`Control-`) and

`Cmd-`(or

`m-`or

`Meta-`) are recognized.

When a key binding contains multiple key names separated by
spaces, it represents a multi-stroke binding, which will fire when
the user presses the given keys after each other.

You can use

`Mod-`as a shorthand for

`Cmd-`on Mac and

`Ctrl-`on
other platforms. So

`Mod-b`is

`Ctrl-b`on Linux but

`Cmd-b`on
macOS.

key `⁠?:`string The key name to use for this binding. If the platform-specific
property (

`mac`,

`win`, or

`linux`) for the current platform is
used as well in the binding, that one takes precedence. If

`key`isn't defined and the platform-specific binding isn't either,
a binding is ignored.

mac `⁠?:`string Key to use specifically on macOS.

win `⁠?:`string Key to use specifically on Windows.

linux `⁠?:`string Key to use specifically on Linux.

run `⁠?:`Command The command to execute when this binding is triggered. When the
command function returns

`false`, further bindings will be tried
for the key.

shift `⁠?:`Command When given, this defines a second binding, using the (possibly
platform-specific) key name prefixed with

`Shift-`to activate
this command.

any `⁠?:`fn `(`view `:`EditorView `,`event `:`KeyboardEvent `) →`boolean When this property is present, the function is called for every
key that is not a multi-stroke prefix.

scope `⁠?:`string By default, key bindings apply when focus is on the editor
content (the

`"editor"`scope). Some extensions, mostly those
that define their own panels, might want to allow you to
register bindings local to that panel. Such bindings should use
a custom scope name. You may also assign multiple scope names to
a binding, separating them by spaces.

preventDefault `⁠?:`boolean When set to true (the default is false), this will always
prevent the further handling for the bound key, even if the
command(s) return false. This can be useful for cases where the
native behavior of the key is annoying or irrelevant but the
command doesn't always apply (such as, Mod-u for undo selection,
which would cause the browser to view source instead when no
selection can be undone).

stopPropagation `⁠?:`boolean When set to true,

`stopPropagation`will be called on keyboard
events that have their

`preventDefault`called in response to
this key binding (see also

`preventDefault`).

keymap `:`Facet `<`readonly KeyBinding `[]>`Facet used for registering keymaps.

You can add multiple keymaps to an editor. Their priorities
determine their precedence (the ones specified early or with high
priority get checked first). When a handler has returned

`true`for a given key, no further handlers are called.

runScopeHandlers `(`view `:`EditorView `,`event `:`KeyboardEvent `,`scope `:`string `) →`boolean Run the key handlers registered for a given scope. The event
object should be a

`"keydown"`event. Returns true if any of the
handlers handled it.

### Decorations

Your code should not try to directly change the DOM structure
CodeMirror creates for its content—that will not work. Instead, the
way to influence how things are drawn is by providing decorations,
which can add styling or replace content with an alternative
representation.

class Decoration extends RangeValue A decoration provides information on how to draw or style a piece
of content. You'll usually use it wrapped in a

`Range`, which adds a start and end position.

spec `:`any The config object used to create this decoration. You can
include additional properties in there to store metadata about
your decoration.

static mark `(`spec `:`Object `) →`Decoration Create a mark decoration, which influences the styling of the
content in its range. Nested mark decorations will cause nested
DOM elements to be created. Nesting order is determined by
precedence of the

facet , with
the higher-precedence decorations creating the inner DOM nodes.
Such elements are split on line boundaries and on the boundaries
of lower-precedence decorations.

spec inclusive `⁠?:`boolean Whether the mark covers its start and end position or not. This
influences whether content inserted at those positions becomes
part of the mark. Defaults to false.

inclusiveStart `⁠?:`boolean Specify whether the start position of the marked range should be
inclusive. Overrides

`inclusive`, when both are present.

inclusiveEnd `⁠?:`boolean Whether the end should be inclusive.

attributes `⁠?:`Object `<`string `>`Add attributes to the DOM elements that hold the text in the
marked range.

class `⁠?:`string Shorthand for

`{attributes: {class: value}}`.

tagName `⁠?:`string Add a wrapping element around the text in the marked range. Note
that there will not necessarily be a single element covering the
entire range—other decorations with lower precedence might split
this one if they partially overlap it, and line breaks always
end decoration elements.

bidiIsolate `⁠?:`Direction When using sets of decorations in

`bidiIsolatedRanges`,
this property provides the direction of the isolates. When null
or not given, it indicates the range has

`dir=auto`, and its
direction should be derived from the first strong directional
character in it.

[string] `:`any Decoration specs allow extra properties, which can be retrieved
through the decoration's

`spec`property.

static widget `(`spec `:`Object `) →`Decoration Create a widget decoration, which displays a DOM element at the
given position.

spec widget `:`WidgetType The type of widget to draw here.

side `⁠?:`number Which side of the given position the widget is on. When this is
positive, the widget will be drawn after the cursor if the
cursor is on the same position. Otherwise, it'll be drawn before
it. When multiple widgets sit at the same position, their

`side`values will determine their ordering—those with a lower value
come first. Defaults to 0. May not be more than 10000 or less
than -10000.

inlineOrder `⁠?:`boolean By default, to avoid unintended mixing of block and inline
widgets, block widgets with a positive

`side`are always drawn
after all inline widgets at that position, and those with a
non-positive side before inline widgets. Setting this option to

`true`for a block widget will turn this off and cause it to be
rendered between the inline widgets, ordered by

`side`.

block `⁠?:`boolean Determines whether this is a block widgets, which will be drawn
between lines, or an inline widget (the default) which is drawn
between the surrounding text.

Note that block-level decorations should not have vertical
margins, and if you dynamically change their height, you should
make sure to call

`requestMeasure`, so that the
editor can update its information about its vertical layout.

[string] `:`any Other properties are allowed.

static replace `(`spec `:`Object `) →`Decoration Create a replace decoration which replaces the given range with
a widget, or simply hides it.

spec widget `⁠?:`WidgetType An optional widget to drawn in the place of the replaced
content.

inclusive `⁠?:`boolean Whether this range covers the positions on its sides. This
influences whether new content becomes part of the range and
whether the cursor can be drawn on its sides. Defaults to false
for inline replacements, and true for block replacements.

inclusiveStart `⁠?:`boolean Set inclusivity at the start.

inclusiveEnd `⁠?:`boolean Set inclusivity at the end.

block `⁠?:`boolean Whether this is a block-level decoration. Defaults to false.

[string] `:`any Other properties are allowed.

static line `(`spec `:`Object `) →`Decoration Create a line decoration, which can add DOM attributes to the
line starting at the given position.

spec attributes `⁠?:`Object `<`string `>`DOM attributes to add to the element wrapping the line.

class `⁠?:`string Shorthand for

`{attributes: {class: value}}`.

[string] `:`any Other properties are allowed.

static set `(`of : Range < Decoration > | readonly Range < Decoration >[], sort ⁠?: boolean = false `) →`DecorationSet Build a

`DecorationSet`from the given
decorated range or ranges. If the ranges aren't already sorted,
pass

`true`for

`sort`to make the library sort them for you.

static none `:`DecorationSet The empty set of decorations.

type DecorationSet `=`RangeSet `<`Decoration `>`A decoration set represents a collection of decorated ranges,
organized for efficient access and mapping. See

`RangeSet`for its methods.

abstract class WidgetType Widgets added to the content are described by subclasses of this
class. Using a description object like that makes it possible to
delay creating of the DOM structure for a widget until it is
needed, and to avoid redrawing widgets even if the decorations
that define them are recreated.

abstract toDOM `(`view `:`EditorView `) →`HTMLElement Build the DOM structure for this widget instance.

eq `(`widget `:`WidgetType `) →`boolean Compare this instance to another instance of the same type.
(TypeScript can't express this, but only instances of the same
specific class will be passed to this method.) This is used to
avoid redrawing widgets when they are replaced by a new
decoration of the same type. The default implementation just
returns

`false`, which will cause new instances of the widget to
always be redrawn.

updateDOM `(`dom `:`HTMLElement `,`view `:`EditorView `) →`boolean Update a DOM element created by a widget of the same type (but
different, non-

`eq`content) to reflect this widget. May return
true to indicate that it could update, false to indicate it
couldn't (in which case the widget will be redrawn). The default
implementation just returns false.

estimatedHeight `:`number The estimated height this widget will have, to be used when
estimating the height of content that hasn't been drawn. May
return -1 to indicate you don't know. The default implementation
returns -1.

lineBreaks `:`number For inline widgets that are displayed inline (as opposed to

`inline-block`) and introduce line breaks (through

`<br>`tags
or textual newlines), this must indicate the amount of line
breaks they introduce. Defaults to 0.

ignoreEvent `(`event `:`Event `) →`boolean Can be used to configure which kinds of events inside the widget
should be ignored by the editor. The default is to ignore all
events.

coordsAt `(`dom `:`HTMLElement `,`pos `:`number `,`side `:`number `) →`Rect `|`null Override the way screen coordinates for positions at/in the
widget are found.

`pos`will be the offset into the widget, and

`side`the side of the position that is being queried—less than
zero for before, greater than zero for after, and zero for
directly at that position.

destroy `(`dom `:`HTMLElement `)`This is called when the an instance of the widget is removed
from the editor view.

class MatchDecorator Helper class used to make it easier to maintain decorations on
visible code that matches a given regular expression. To be used
in a

view plugin . Instances of this object
represent a matching configuration.

new MatchDecorator `(`config `:`Object `)`Create a decorator.

config regexp `:`RegExp The regular expression to match against the content. Will only
be matched inside lines (not across them). Should have its 'g'
flag set.

decoration `⁠?:`Decoration `|`fn ( match : RegExpExecArray , view : EditorView , pos : number ) → Decoration | null The decoration to apply to matches, either directly or as a
function of the match.

decorate `⁠?:`fn `(`add : fn ( from : number , to : number , decoration : Decoration ), from : number , to : number , match : RegExpExecArray , view : EditorView `)`Customize the way decorations are added for matches. This
function, when given, will be called for matches and should
call

`add`to create decorations for them. Note that the
decorations should appear

in the given range, and the
function should have no side effects beyond calling

`add`.

The

`decoration`option is ignored when

`decorate`is
provided.

boundary `⁠?:`RegExp By default, changed lines are re-matched entirely. You can
provide a boundary expression, which should match single
character strings that can never occur in

`regexp`, to reduce
the amount of re-matching.

maxLength `⁠?:`number Matching happens by line, by default, but when lines are
folded or very long lines are only partially drawn, the
decorator may avoid matching part of them for speed. This
controls how much additional invisible content it should
include in its matches. Defaults to 1000.

createDeco `(`view `:`EditorView `) →`RangeSet `<`Decoration `>`Compute the full set of decorations for matches in the given
view's viewport. You'll want to call this when initializing your
plugin.

updateDeco `(`update `:`ViewUpdate `,`deco `:`DecorationSet `) →`DecorationSet Update a set of decorations for a view update.

`deco`must be
the set of decorations produced by

this `MatchDecorator`for
the view state before the update.

### Gutters

Functionality for showing "gutters" (for line numbers or other
purposes) on the side of the editor. See also the

gutter
example .

lineNumbers `(`config `⁠?:`Object = {} `) →`Extension Create a line number gutter extension.

config formatNumber `⁠?:`fn `(`lineNo `:`number `,`state `:`EditorState `) →`string How to display line numbers. Defaults to simply converting them
to string.

domEventHandlers `⁠?:`Object `<`fn ( view : EditorView , line : BlockInfo , event : Event ) → boolean `>`Supply event handlers for DOM events on this gutter.

highlightActiveLineGutter `() →`Extension Returns an extension that adds a

`cm-activeLineGutter`class to
all gutter elements on the

active
line .

gutter `(`config `:`Object `) →`Extension Define an editor gutter. The order in which the gutters appear is
determined by their extension priority.

config class `⁠?:`string An extra CSS class to be added to the wrapper (

`cm-gutter`)
element.

renderEmptyElements `⁠?:`boolean Controls whether empty gutter elements should be rendered.
Defaults to false.

markers `⁠?:`fn `(`view `:`EditorView `) →`RangeSet `<`GutterMarker `> |`readonly RangeSet < GutterMarker >[] Retrieve a set of markers to use in this gutter.

lineMarker `⁠?:`fn `(`view : EditorView , line : BlockInfo , otherMarkers : readonly GutterMarker [] `) →`GutterMarker `|`null Can be used to optionally add a single marker to every line.

widgetMarker `⁠?:`fn `(`view `:`EditorView `,`widget `:`WidgetType `,`block `:`BlockInfo `) →`GutterMarker `|`null Associate markers with block widgets in the document.

lineMarkerChange `⁠?:`fn `(`update `:`ViewUpdate `) →`boolean If line or widget markers depend on additional state, and should
be updated when that changes, pass a predicate here that checks
whether a given view update might change the line markers.

initialSpacer `⁠?:`fn `(`view `:`EditorView `) →`GutterMarker Add a hidden spacer element that gives the gutter its base
width.

updateSpacer `⁠?:`fn `(`spacer `:`GutterMarker `,`update `:`ViewUpdate `) →`GutterMarker Update the spacer element when the view is updated.

domEventHandlers `⁠?:`Object `<`fn ( view : EditorView , line : BlockInfo , event : Event ) → boolean `>`Supply event handlers for DOM events on this gutter.

gutters `(`config `⁠?: {`fixed `⁠?:`boolean `}) →`Extension The gutter-drawing plugin is automatically enabled when you add a
gutter, but you can use this function to explicitly configure it.

Unless

`fixed`is explicitly set to

`false`, the gutters are
fixed, meaning they don't scroll along with the content
horizontally (except on Internet Explorer, which doesn't support
CSS

`position: sticky`).

abstract class GutterMarker extends RangeValue A gutter marker represents a bit of information attached to a line
in a specific gutter. Your own custom markers have to extend this
class.

eq `(`other `:`GutterMarker `) →`boolean Compare this marker to another marker of the same type.

toDOM `⁠?:`fn `(`view `:`EditorView `) →`Node Render the DOM node for this marker, if any.

elementClass `:`string This property can be used to add CSS classes to the gutter
element that contains this marker.

destroy `(`dom `:`Node `)`Called if the marker has a

`toDOM`method and its representation
was removed from a gutter.

gutterLineClass `:`Facet `<`RangeSet `<`GutterMarker `>>`Facet used to add a class to all gutter elements for a given line.
Markers given to this facet should

only define an

`elementclass`, not a

`toDOM`(or the marker will appear
in all gutters for the line).

gutterWidgetClass `:`Facet `<`fn ( view : EditorView , widget : WidgetType , block : BlockInfo ) → GutterMarker | null `>`Facet used to add a class to all gutter elements next to a widget.
Should not provide widgets with a

`toDOM`method.

lineNumberMarkers `:`Facet `<`RangeSet `<`GutterMarker `>>`Facet used to provide markers to the line number gutter.

lineNumberWidgetMarker `:`Facet `<`fn ( view : EditorView , widget : WidgetType , block : BlockInfo ) → GutterMarker | null `>`Facet used to create markers in the line number gutter next to widgets.

### Tooltips

Tooltips are DOM elements overlaid on the editor near a given document
position. This package helps manage and position such elements.

See also the

tooltip example .

showTooltip `:`Facet `<`Tooltip `|`null `>`Facet to which an extension can add a value to show a tooltip.

interface Tooltip Describes a tooltip. Values of this type, when provided through
the

`showTooltip`facet, control the
individual tooltips on the editor.

pos `:`number The document position at which to show the tooltip.

end `⁠?:`number The end of the range annotated by this tooltip, if different
from

`pos`.

create `(`view `:`EditorView `) →`TooltipView A constructor function that creates the tooltip's

DOM
representation .

above `⁠?:`boolean Whether the tooltip should be shown above or below the target
position. Not guaranteed to be respected for hover tooltips
since all hover tooltips for the same range are always
positioned together. Defaults to false.

strictSide `⁠?:`boolean Whether the

`above`option should be honored when there isn't
enough space on that side to show the tooltip inside the
viewport. Defaults to false.

arrow `⁠?:`boolean When set to true, show a triangle connecting the tooltip element
to position

`pos`.

clip `⁠?:`boolean By default, tooltips are hidden when their position is outside
of the visible editor content. Set this to false to turn that
off.

interface TooltipView Describes the way a tooltip is displayed.

dom `:`HTMLElement The DOM element to position over the editor.

offset `⁠?: {`x `:`number `,`y `:`number `}`Adjust the position of the tooltip relative to its anchor
position. A positive

`x`value will move the tooltip
horizontally along with the text direction (so right in
left-to-right context, left in right-to-left). A positive

`y`will move the tooltip up when it is above its anchor, and down
otherwise.

getCoords `⁠?:`fn `(`pos `:`number `) →`Rect By default, a tooltip's screen position will be based on the
text position of its

`pos`property. This method can be provided
to make the tooltip view itself responsible for finding its
screen position.

overlap `⁠?:`boolean By default, tooltips are moved when they overlap with other
tooltips. Set this to

`true`to disable that behavior for this
tooltip.

mount `⁠?:`fn `(`view `:`EditorView `)`Called after the tooltip is added to the DOM for the first time.

update `⁠?:`fn `(`update `:`ViewUpdate `)`Update the DOM element for a change in the view's state.

destroy `⁠?:`fn `()`Called when the tooltip is removed from the editor or the editor
is destroyed.

positioned `⁠?:`fn `(`space `:`Rect `)`Called when the tooltip has been (re)positioned. The argument is
the

space available to the
tooltip.

resize `⁠?:`boolean By default, the library will restrict the size of tooltips so
that they don't stick out of the available space. Set this to
false to disable that.

tooltips `(`config `⁠?:`Object = {} `) →`Extension Creates an extension that configures tooltip behavior.

config position `⁠?:`"fixed" `|`"absolute" By default, tooltips use

`"fixed"`positioning ,
which has the advantage that tooltips don't get cut off by
scrollable parent elements. However, CSS rules like

`contain: layout`can break fixed positioning in child nodes, which can be
worked about by using

`"absolute"`here.

On iOS, which at the time of writing still doesn't properly
support fixed positioning, the library always uses absolute
positioning.

If the tooltip parent element sits in a transformed element, the
library also falls back to absolute positioning.

parent `⁠?:`HTMLElement The element to put the tooltips into. By default, they are put
in the editor (

`cm-editor`) element, and that is usually what
you want. But in some layouts that can lead to positioning
issues, and you need to use a different parent to work around
those.

tooltipSpace `⁠?:`fn `(`view `:`EditorView `) →`Rect By default, when figuring out whether there is room for a
tooltip at a given position, the extension considers the entire
space between 0,0 and

`documentElement.clientWidth`/

`clientHeight`to be available for
showing tooltips. You can provide a function here that returns
an alternative rectangle.

getTooltip `(`view `:`EditorView `,`tooltip `:`Tooltip `) →`TooltipView `|`null Get the active tooltip view for a given tooltip, if available.

hoverTooltip `(`source `:`HoverTooltipSource `,`options `⁠?:`Object = {} `) → {`extension `:`Extension `} &`{ active : StateField < readonly Tooltip []>} `|`readonly Extension [] & { active : StateField < readonly Tooltip []>} Set up a hover tooltip, which shows up when the pointer hovers
over ranges of text. The callback is called when the mouse hovers
over the document text. It should, if there is a tooltip
associated with position

`pos`, return the tooltip description
(either directly or in a promise). The

`side`argument indicates
on which side of the position the pointer is—it will be -1 if the
pointer is before the position, 1 if after the position.

Note that all hover tooltips are hosted within a single tooltip
container element. This allows multiple tooltips over the same
range to be "merged" together without overlapping.

The return value is a valid

editor extension but also provides an

`active`property holding a state field that
can be used to read the currently active tooltips produced by this
extension.

options hideOn `⁠?:`fn `(`tr `:`Transaction `,`tooltip `:`Tooltip `) →`boolean Controls whether a transaction hides the tooltip. The default
is to not hide.

hideOnChange `⁠?:`boolean `|`"touch" When enabled (this defaults to false), close the tooltip
whenever the document changes or the selection is set.

hoverTime `⁠?:`number Hover time after which the tooltip should appear, in
milliseconds. Defaults to 300ms.

type HoverTooltipSource `=`fn `(`view `:`EditorView `,`pos `:`number `,`side `:`-1 `|`1 `) →`Tooltip `|`readonly Tooltip [] | Promise < Tooltip | readonly Tooltip [] | null > | null The type of function that can be used as a

hover tooltip
source .

hasHoverTooltips `(`state `:`EditorState `) →`boolean Returns true if any hover tooltips are currently active.

closeHoverTooltips `:`StateEffect `<`null `>`Transaction effect that closes all hover tooltips.

repositionTooltips `(`view `:`EditorView `)`Tell the tooltip extension to recompute the position of the active
tooltips. This can be useful when something happens (such as a
re-positioning or CSS change affecting the editor) that could
invalidate the existing tooltip positions.

### Panels

Panels are UI elements positioned above or below the editor (things
like a search dialog). They will take space from the editor when it
has a fixed height, and will stay in view even when the editor is
partially scrolled out of view.

See also the

panel example .

showPanel `:`Facet `<`PanelConstructor `|`null `>`Opening a panel is done by providing a constructor function for
the panel through this facet. (The panel is closed again when its
constructor is no longer provided.) Values of

`null`are ignored.

type PanelConstructor `=`fn `(`view `:`EditorView `) →`Panel A function that initializes a panel. Used in

`showPanel`.

interface Panel Object that describes an active panel.

dom `:`HTMLElement The element representing this panel. The library will add the

`"cm-panel"`DOM class to this.

mount `⁠?:`fn `()`Optionally called after the panel has been added to the editor.

update `⁠?:`fn `(`update `:`ViewUpdate `)`Update the DOM for a given view update.

destroy `⁠?:`fn `()`Called when the panel is removed from the editor or the editor
is destroyed.

top `⁠?:`boolean Whether the panel should be at the top or bottom of the editor.
Defaults to false.

getPanel `(`view `:`EditorView `,`panel `:`PanelConstructor `) →`Panel `|`null Get the active panel created by the given constructor, if any.
This can be useful when you need access to your panels' DOM
structure.

panels `(`config `⁠?:`Object `) →`Extension Configures the panel-managing extension.

config topContainer `⁠?:`HTMLElement By default, panels will be placed inside the editor's DOM
structure. You can use this option to override where panels with

`top: true`are placed.

bottomContainer `⁠?:`HTMLElement Override where panels with

`top: false`are placed.

### Layers

Layers are sets of DOM elements drawn over or below the document text.
They can be useful for displaying user interface elements that don't
take up space and shouldn't influence line wrapping, such as
additional cursors.

Note that, being outside of the regular DOM order, such elements are
invisible to screen readers. Make sure to also

provide any important information they
convey in an accessible way.

layer `(`config `:`Object `) →`Extension Define a layer.

config above `:`boolean Determines whether this layer is shown above or below the text.

class `⁠?:`string When given, this class is added to the DOM element that will
wrap the markers.

update `(`update `:`ViewUpdate `,`layer `:`HTMLElement `) →`boolean Called on every view update. Returning true triggers a marker
update (a call to

`markers`and drawing of those markers).

updateOnDocViewUpdate `⁠?:`boolean Whether to update this layer every time the document view
changes. Defaults to true.

markers `(`view `:`EditorView `) →`readonly LayerMarker `[]`Build a set of markers for this layer, and measure their
dimensions.

mount `⁠?:`fn `(`layer `:`HTMLElement `,`view `:`EditorView `)`If given, this is called when the layer is created.

destroy `⁠?:`fn `(`layer `:`HTMLElement `,`view `:`EditorView `)`If given, called when the layer is removed from the editor or
the entire editor is destroyed.

interface LayerMarker Markers shown in a

layer must conform to this
interface. They are created in a measuring phase, and have to
contain all their positioning information, so that they can be
drawn without further DOM layout reading.

Markers are automatically absolutely positioned. Their parent
element has the same top-left corner as the document, so they
should be positioned relative to the document.

eq `(`other `:`LayerMarker `) →`boolean Compare this marker to a marker of the same type. Used to avoid
unnecessary redraws.

draw `() →`HTMLElement Draw the marker to the DOM.

update `⁠?:`fn `(`dom `:`HTMLElement `,`oldMarker `:`LayerMarker `) →`boolean Update an existing marker of this type to this marker.

class RectangleMarker implements LayerMarker Implementation of

`LayerMarker`that creates
a rectangle at a given set of coordinates.

new RectangleMarker `(`className : string , left : number , top : number , width : number | null , height : number `)`Create a marker with the given class and dimensions. If

`width`is null, the DOM element will get no width style.

left `:`number The left position of the marker (in pixels, document-relative).

top `:`number The top position of the marker.

width `:`number `|`null The width of the marker, or null if it shouldn't get a width assigned.

height `:`number The height of the marker.

static forRange `(`view : EditorView , className : string , range : SelectionRange `) →`readonly RectangleMarker `[]`Create a set of rectangles for the given selection range,
assigning them theclass

`className`. Will create a single
rectangle for empty ranges, and a set of selection-style
rectangles covering the range's content (in a bidi-aware
way) for non-empty ones.

### Rectangular Selection

rectangularSelection `(`options `⁠?:`Object `) →`Extension Create an extension that enables rectangular selections. By
default, it will react to left mouse drag with the Alt key held
down. When such a selection occurs, the text within the rectangle
that was dragged over will be selected, as one selection

range per line.

options eventFilter `⁠?:`fn `(`event `:`MouseEvent `) →`boolean A custom predicate function, which takes a

`mousedown`event and
returns true if it should be used for rectangular selection.

crosshairCursor `(`options ⁠?: { key ⁠?: "Alt" | "Control" | "Shift" | "Meta" } = {} `) →`Extension Returns an extension that turns the pointer cursor into a
crosshair when a given modifier key, defaulting to Alt, is held
down. Can serve as a visual hint that rectangular selection is
going to happen when paired with

`rectangularSelection`.

@codemirror/ language languageDataProp `:`NodeProp `<`Facet `<`Object `<`any `>>>`Node prop stored in a parser's top syntax node to provide the
facet that stores language-specific data for that language.

class Language A language object manages parsing and per-language

metadata . Parse data is
managed as a

Lezer tree. The class
can be used directly, via the

`LRLanguage`subclass for

Lezer LR parsers, or
via the

`StreamLanguage`subclass
for stream parsers.

new Language `(`data : Facet < Object < any >>, parser : Parser , extraExtensions ⁠?: Extension [] = [] , name ⁠?: string = "" `)`Construct a language object. If you need to invoke this
directly, first define a data facet with

`defineLanguageFacet`, and then
configure your parser to

attach it
to the language's outer syntax node.

extension `:`Extension The extension value to install this as the document language.

parser `:`Parser The parser object. Can be useful when using this as a

nested
parser .

data `:`Facet `<`Object `<`any `>>`The

language data facet
used for this language.

name `:`string A language name.

isActiveAt `(`state : EditorState , pos : number , side ⁠?: -1 | 0 | 1 = -1 `) →`boolean Query whether this language is active at the given position.

findRegions `(`state `:`EditorState `) → {`from `:`number `,`to `:`number `}[]`Find the document regions that were parsed using this language.
The returned regions will

include any nested languages rooted
in this language, when those exist.

allowsNesting `:`boolean Indicates whether this language allows nested languages. The
default implementation returns true.

defineLanguageFacet `(`baseData `⁠?:`Object `<`any `>) →`Facet `<`Object `<`any `>>`Helper function to define a facet (to be added to the top syntax
node(s) for a language via

`languageDataProp`), that will be
used to associate language data with the language. You
probably only need this when subclassing

`Language`.

interface Sublanguage Some languages need to return different

language
data for some parts of their
tree. Sublanguages, registered by adding a

node
prop to the language's top syntax
node, provide a mechanism to do this.

(Note that when using nested parsing, where nested syntax is
parsed by a different parser and has its own top node type, you
don't need a sublanguage.)

type `⁠?:`"replace" `|`"extend" Determines whether the data provided by this sublanguage should
completely replace the regular data or be added to it (with
higher-precedence). The default is

`"extend"`.

test `(`node `:`SyntaxNode `,`state `:`EditorState `) →`boolean A predicate that returns whether the node at the queried
position is part of the sublanguage.

facet `:`Facet `<`Object `<`any `>>`The language data facet that holds the sublanguage's data.
You'll want to use

`defineLanguageFacet`to create
this.

sublanguageProp `:`NodeProp `<`Sublanguage `[]>`Syntax node prop used to register sublanguages. Should be added to
the top level node type for the language.

language `:`Facet `<`Language `,`Language `|`null `>`The facet used to associate a language with an editor state. Used
by

`Language`object's

`extension`property (so you don't need to
manually wrap your languages in this). Can be used to access the
current language on a state.

class LRLanguage extends Language A subclass of

`Language`for use with Lezer

LR parsers parsers.

configure `(`options `:`ParserConfig `,`name `⁠?:`string `) →`LRLanguage Create a new instance of this language with a reconfigured
version of its parser and optionally a new name.

static define `(`spec `:`Object `) →`LRLanguage Define a language from a parser.

spec name `⁠?:`string The

name of the language.

parser `:`LRParser The parser to use. Should already have added editor-relevant
node props (and optionally things like dialect and top rule)
configured.

languageData `⁠?:`Object `<`any `>`Language data to register for this language.

class ParseContext A parse context provided to parsers working on the editor content.

state `:`EditorState The current editor state.

fragments `:`readonly TreeFragment `[]`Tree fragments that can be reused by incremental re-parses.

viewport `: {`from `:`number `,`to `:`number `}`The current editor viewport (or some overapproximation
thereof). Intended to be used for opportunistically avoiding
work (in which case

`skipUntilInView`should be called to make sure the parser is restarted when the
skipped region becomes visible).

skipUntilInView `(`from `:`number `,`to `:`number `)`Notify the parse scheduler that the given region was skipped
because it wasn't in view, and the parse should be restarted
when it comes into view.

static getSkippingParser `(`until `⁠?:`Promise `<`unknown `>) →`Parser Returns a parser intended to be used as placeholder when
asynchronously loading a nested parser. It'll skip its input and
mark it as not-really-parsed, so that the next update will parse
it again.

When

`until`is given, a reparse will be scheduled when that
promise resolves.

static get `() →`ParseContext `|`null Get the context for the current parse, or

`null`if no editor
parse is in progress.

syntaxTree `(`state `:`EditorState `) →`Tree Get the syntax tree for a state, which is the current (possibly
incomplete) parse tree of the active

language , or the empty tree if there is no
language available.

ensureSyntaxTree `(`state `:`EditorState `,`upto `:`number `,`timeout `⁠?:`number = 50 `) →`Tree `|`null Try to get a parse tree that spans at least up to

`upto`. The
method will do at most

`timeout`milliseconds of work to parse
up to that point if the tree isn't already available.

syntaxTreeAvailable `(`state `:`EditorState `,`upto `⁠?:`number = state.doc.length `) →`boolean Queries whether there is a full syntax tree available up to the
given document position. If there isn't, the background parse
process

might still be working and update the tree further, but
there is no guarantee of that—the parser will

stop
working when it has spent a
certain amount of time or has moved beyond the visible viewport.
Always returns false if no language has been enabled.

forceParsing `(`view : EditorView , upto ⁠?: number = view.viewport.to , timeout ⁠?: number = 100 `) →`boolean Move parsing forward, and update the editor state afterwards to
reflect the new tree. Will work for at most

`timeout`milliseconds. Returns true if the parser managed get to the given
position in that time.

syntaxParserRunning `(`view `:`EditorView `) →`boolean Tells you whether the language parser is planning to do more
parsing work (in a

`requestIdleCallback`pseudo-thread) or has
stopped running, either because it parsed the entire document,
because it spent too much time and was cut off, or because there
is no language parser enabled.

class LanguageSupport This class bundles a

language with an
optional set of supporting extensions. Language packages are
encouraged to export a function that optionally takes a
configuration object and returns a

`LanguageSupport`instance, as
the main way for client code to use the package.

new LanguageSupport `(`language `:`Language `,`support `⁠?:`Extension = [] `)`Create a language support object.

extension `:`Extension An extension including both the language and its support
extensions. (Allowing the object to be used as an extension
value itself.)

language `:`Language The language object.

support `:`Extension An optional set of supporting extensions. When nesting a
language in another language, the outer language is encouraged
to include the supporting extensions for its inner languages
in its own set of support extensions.

class LanguageDescription Language descriptions are used to store metadata about languages
and to dynamically load them. Their main role is finding the
appropriate language for a filename or dynamically loading nested
parsers.

name `:`string The name of this language.

alias `:`readonly string `[]`Alternative names for the mode (lowercased, includes

`this.name`).

extensions `:`readonly string `[]`File extensions associated with this language.

filename `:`RegExp `|`undefined Optional filename pattern that should be associated with this
language.

support `:`LanguageSupport `|`undefined If the language has been loaded, this will hold its value.

load `() →`Promise `<`LanguageSupport `>`Start loading the the language. Will return a promise that
resolves to a

`LanguageSupport`object when the language successfully loads.

static of `(`spec `:`Object `) →`LanguageDescription Create a language description.

spec name `:`string The language's name.

alias `⁠?:`readonly string `[]`An optional array of alternative names.

extensions `⁠?:`readonly string `[]`An optional array of filename extensions associated with this
language.

filename `⁠?:`RegExp An optional filename pattern associated with this language.

load `⁠?:`fn `() →`Promise `<`LanguageSupport `>`A function that will asynchronously load the language.

support `⁠?:`LanguageSupport Alternatively to

`load`, you can provide an already loaded
support object. Either this or

`load`should be provided.

static matchFilename `(`descs : readonly LanguageDescription [], filename : string `) →`LanguageDescription `|`null Look for a language in the given array of descriptions that
matches the filename. Will first match

`filename`patterns,
and then

extensions ,
and return the first language that matches.

static matchLanguageName `(`descs : readonly LanguageDescription [], name : string , fuzzy ⁠?: boolean = true `) →`LanguageDescription `|`null Look for a language whose name or alias matches the the given
name (case-insensitively). If

`fuzzy`is true, and no direct
matchs is found, this'll also search for a language whose name
or alias occurs in the string (for names shorter than three
characters, only when surrounded by non-word characters).

class DocInput implements Input Lezer-style

`Input`object for a

`Text`object.

new DocInput `(`doc `:`Text `)`Create an input object for the given document.

doc `:`Text ### Highlighting

class HighlightStyle implements Highlighter A highlight style associates CSS styles with higlighting

tags .

module `:`StyleModule `|`null A style module holding the CSS rules for this highlight style.
When using

`highlightTree`outside of the editor, you may want to manually mount this
module to show the highlighting.

specs `:`readonly TagStyle `[]`The tag styles used to create this highlight style.

static define `(`specs `:`readonly TagStyle `[],`options `⁠?:`Object `) →`HighlightStyle Create a highlighter style that associates the given styles to
the given tags. The specs must be objects that hold a style tag
or array of tags in their

`tag`property, and either a single

`class`property providing a static CSS class (for highlighter
that rely on external styling), or a

`style-mod`-style
set of CSS properties (which define the styling for those tags).

The CSS rules created for a highlighter will be emitted in the
order of the spec's properties. That means that for elements that
have multiple tags associated with them, styles defined further
down in the list will have a higher CSS precedence than styles
defined earlier.

options scope `⁠?:`Language `|`NodeType By default, highlighters apply to the entire document. You can
scope them to a single language by providing the language
object or a language's top node type here.

all `⁠?:`string `|`StyleSpec Add a style to

all content. Probably only useful in
combination with

`scope`.

themeType `⁠?:`"dark" `|`"light" Specify that this highlight style should only be active then
the theme is dark or light. By default, it is active
regardless of theme.

syntaxHighlighting `(`highlighter `:`Highlighter `,`options `⁠?:`Object `) →`Extension Wrap a highlighter in an editor extension that uses it to apply
syntax highlighting to the editor content.

When multiple (non-fallback) styles are provided, the styling
applied is the union of the classes they emit.

options fallback `:`boolean When enabled, this marks the highlighter as a fallback, which
only takes effect if no other highlighters are registered.

interface TagStyle The type of object used in

`HighlightStyle.define`.
Assigns a style to one or more highlighting

tags , which can either be a fixed class name
(which must be defined elsewhere), or a set of CSS properties, for
which the library will define an anonymous class.

tag `:`Tag `|`readonly Tag `[]`The tag or tags to target.

class `⁠?:`string If given, this maps the tags to a fixed class name.

[string] `:`any Any further properties (if

`class`isn't given) will be
interpreted as in style objects given to

style-mod .
(The type here is

`any`because of TypeScript limitations.)

defaultHighlightStyle `:`HighlightStyle A default highlight style (works well with light themes).

highlightingFor `(`state : EditorState , tags : readonly Tag [], scope ⁠?: NodeType `) →`string `|`null Returns the CSS classes (if any) that the highlighters active in
the state would assign to the given style

tags and
(optional) language

scope .

bidiIsolates `(`options `⁠?:`Object = {} `) →`Extension Make sure nodes

marked as isolating for bidirectional text are rendered in a way that
isolates them from the surrounding text.

options alwaysIsolate `⁠?:`boolean By default, isolating elements are only added when the editor
direction isn't uniformly left-to-right, or if it is, on lines
that contain right-to-left character. When true, disable this
optimization and add them everywhere.

### Folding

These exports provide commands and other functionality related to code
folding (temporarily hiding pieces of code).

foldService `:`Facet `<`fn ( state : EditorState , lineStart : number , lineEnd : number ) → { from : number , to : number } | null `>`A facet that registers a code folding service. When called with
the extent of a line, such a function should return a foldable
range that starts on that line (but continues beyond it), if one
can be found.

foldNodeProp `:`NodeProp `<`fn ( node : SyntaxNode , state : EditorState ) → { from : number , to : number } | null `>`This node prop is used to associate folding information with
syntax node types. Given a syntax node, it should check whether
that tree is foldable and return the range that can be collapsed
when it is.

foldInside `(`node `:`SyntaxNode `) → {`from `:`number `,`to `:`number `} |`null Fold function that folds everything but
the first and the last child of a syntax node. Useful for nodes
that start and end with delimiters.

foldable `(`state `:`EditorState `,`lineStart `:`number `,`lineEnd `:`number `) → {`from `:`number `,`to `:`number `} |`null Check whether the given line is foldable. First asks any fold
services registered through

`foldService`, and if none of them return
a result, tries to query the

fold node
prop of syntax nodes that cover the end
of the line.

foldCode `:`Command Fold the lines that are selected, if possible.

unfoldCode `:`Command Unfold folded ranges on selected lines.

toggleFold `:`Command Toggle folding at cursors. Unfolds if there is an existing fold
starting in that line, tries to find a foldable range around it
otherwise.

foldAll `:`Command Fold all top-level foldable ranges. Note that, in most cases,
folding information will depend on the

syntax
tree , and folding everything may not work
reliably when the document hasn't been fully parsed (either
because the editor state was only just initialized, or because the
document is so big that the parser decided not to parse it
entirely).

unfoldAll `:`Command Unfold all folded code.

foldKeymap `:`readonly KeyBinding `[]`Default fold-related key bindings.

- Ctrl-Shift-[ (Cmd-Alt-[ on macOS):
`foldCode`- .
- Ctrl-Shift-] (Cmd-Alt-] on macOS):
`unfoldCode`- .
- Ctrl-Alt-[:
`foldAll`- .
- Ctrl-Alt-]:
`unfoldAll`- .
codeFolding `(`config `⁠?:`Object `) →`Extension Create an extension that configures code folding.

config placeholderDOM `⁠?:`fn `(`view : EditorView , onclick : fn ( event : Event ), prepared : any `) →`HTMLElement A function that creates the DOM element used to indicate the
position of folded code. The

`onclick`argument is the default
click event handler, which toggles folding on the line that
holds the element, and should probably be added as an event
handler to the returned element. If

`preparePlaceholder`is given, its result will be passed as 3rd argument. Otherwise,
this will be null.

When this option isn't given, the

`placeholderText`option will
be used to create the placeholder element.

placeholderText `⁠?:`string Text to use as placeholder for folded text. Defaults to

`"…"`.
Will be styled with the

`"cm-foldPlaceholder"`class.

preparePlaceholder `⁠?:`fn `(`state : EditorState , range : { from : number , to : number } `) →`any Given a range that is being folded, create a value that
describes it, to be used by

`placeholderDOM`to render a custom
widget that, for example, indicates something about the folded
range's size or type.

foldGutter `(`config `⁠?:`Object = {} `) →`Extension Create an extension that registers a fold gutter, which shows a
fold status indicator before foldable lines (which can be clicked
to fold or unfold the line).

config markerDOM `⁠?:`fn `(`open `:`boolean `) →`HTMLElement A function that creates the DOM element used to indicate a
given line is folded or can be folded.
When not given, the

`openText`/

`closeText`option will be used instead.

openText `⁠?:`string Text used to indicate that a given line can be folded.
Defaults to

`"⌄"`.

closedText `⁠?:`string Text used to indicate that a given line is folded.
Defaults to

`"›"`.

domEventHandlers `⁠?:`Object `<`fn ( view : EditorView , line : BlockInfo , event : Event ) → boolean `>`Supply event handlers for DOM events on this gutter.

foldingChanged `⁠?:`fn `(`update `:`ViewUpdate `) →`boolean When given, if this returns true for a given view update,
recompute the fold markers.

The following functions provide more direct, low-level control over
the fold state.

foldedRanges `(`state `:`EditorState `) →`DecorationSet Get a

range set containing the folded ranges
in the given state.

foldState `:`StateField `<`DecorationSet `>`The state field that stores the folded ranges (as a

decoration
set ). Can be passed to

`EditorState.toJSON`and

`fromJSON`to serialize the fold
state.

foldEffect `:`StateEffectType `<{`from `:`number `,`to `:`number `}>`State effect that can be attached to a transaction to fold the
given range. (You probably only need this in exceptional
circumstances—usually you'll just want to let

`foldCode`and the

fold
gutter create the transactions.)

unfoldEffect `:`StateEffectType `<{`from `:`number `,`to `:`number `}>`State effect that unfolds the given range (if it was folded).

### Indentation

indentService `:`Facet `<`fn ( context : IndentContext , pos : number ) → number | null | undefined `>`Facet that defines a way to provide a function that computes the
appropriate indentation depth, as a column number (see

`indentString`), at the start of a given
line. A return value of

`null`indicates no indentation can be
determined, and the line should inherit the indentation of the one
above it. A return value of

`undefined`defers to the next indent
service.

indentNodeProp `:`NodeProp `<`fn `(`context `:`TreeIndentContext `) →`number `|`null `>`A syntax tree node prop used to associate indentation strategies
with node types. Such a strategy is a function from an indentation
context to a column number (see also

`indentString`) or null, where null
indicates that no definitive indentation can be determined.

getIndentation `(`context `:`IndentContext `|`EditorState `,`pos `:`number `) →`number `|`null Get the indentation, as a column number, at the given position.
Will first consult any

indent services that are registered, and if none of those return an indentation,
this will check the syntax tree for the

indent node
prop and use that if found. Returns a
number when an indentation could be determined, and null
otherwise.

indentRange `(`state `:`EditorState `,`from `:`number `,`to `:`number `) →`ChangeSet Create a change set that auto-indents all lines touched by the
given document range.

indentUnit `:`Facet `<`string `,`string `>`Facet for overriding the unit by which indentation happens. Should
be a string consisting either entirely of the same whitespace
character. When not set, this defaults to 2 spaces.

getIndentUnit `(`state `:`EditorState `) →`number Return the

column width of an indent unit in the state.
Determined by the

`indentUnit`facet, and

`tabSize`when that
contains tabs.

indentString `(`state `:`EditorState `,`cols `:`number `) →`string Create an indentation string that covers columns 0 to

`cols`.
Will use tabs for as much of the columns as possible when the

`indentUnit`facet contains
tabs.

class IndentContext Indentation contexts are used when calling

indentation
services . They provide helper utilities
useful in indentation logic, and can selectively override the
indentation reported for some lines.

new IndentContext `(`state `:`EditorState `,`options `⁠?:`Object = {} `)`Create an indent context.

options overrideIndentation `⁠?:`fn `(`pos `:`number `) →`number Override line indentations provided to the indentation
helper function, which is useful when implementing region
indentation, where indentation for later lines needs to refer
to previous lines, which may have been reindented compared to
the original start state. If given, this function should
return -1 for lines (given by start position) that didn't
change, and an updated indentation otherwise.

simulateBreak `⁠?:`number Make it look, to the indent logic, like a line break was
added at the given position (which is mostly just useful for
implementing something like

`insertNewlineAndIndent`).

simulateDoubleBreak `⁠?:`boolean When

`simulateBreak`is given, this can be used to make the
simulated break behave like a double line break.

unit `:`number The indent unit (number of columns per indentation level).

state `:`EditorState The editor state.

lineAt `(`pos `:`number `,`bias `⁠?:`-1 `|`1 = 1 `) → {`text `:`string `,`from `:`number `}`Get a description of the line at the given position, taking

simulated line
breaks into account. If there is such a break at

`pos`, the

`bias`argument determines whether the part of the line line before or
after the break is used.

textAfterPos `(`pos `:`number `,`bias `⁠?:`-1 `|`1 = 1 `) →`string Get the text directly after

`pos`, either the entire line
or the next 100 characters, whichever is shorter.

column `(`pos `:`number `,`bias `⁠?:`-1 `|`1 = 1 `) →`number Find the column for the given position.

countColumn `(`line `:`string `,`pos `⁠?:`number = line.length `) →`number Find the column position (taking tabs into account) of the given
position in the given string.

lineIndent `(`pos `:`number `,`bias `⁠?:`-1 `|`1 = 1 `) →`number Find the indentation column of the line at the given point.

simulatedBreak `:`number `|`null Returns the

simulated line
break for this context, if any.

class TreeIndentContext extends IndentContext Objects of this type provide context information and helper
methods to indentation functions registered on syntax nodes.

pos `:`number The position at which indentation is being computed.

node `:`SyntaxNode The syntax tree node to which the indentation strategy
applies.

textAfter `:`string Get the text directly after

`this.pos`, either the entire line
or the next 100 characters, whichever is shorter.

baseIndent `:`number Get the indentation at the reference line for

`this.node`, which
is the line on which it starts, unless there is a node that is

not a parent of this node covering the start of that line. If
so, the line at the start of that node is tried, again skipping
on if it is covered by another such node.

baseIndentFor `(`node `:`SyntaxNode `) →`number Get the indentation for the reference line of the given node
(see

`baseIndent`).

continue `() →`number `|`null Continue looking for indentations in the node's parent nodes,
and return the result of that.

delimitedIndent `({`closing `:`string `,`align `⁠?:`boolean `,`units `⁠?:`number `}) →`fn `(`context `:`TreeIndentContext `) →`number An indentation strategy for delimited (usually bracketed) nodes.
Will, by default, indent one unit more than the parent's base
indent unless the line starts with a closing token. When

`align`is true and there are non-skipped nodes on the node's opening
line, the content of the node will be aligned with the end of the
opening node, like this:

`foo(bar,
    baz)`continuedIndent `({`except `⁠?:`RegExp `,`units `⁠?:`number `}`= {} `) →`fn `(`context `:`TreeIndentContext `) →`number Creates an indentation strategy that, by default, indents
continued lines one unit more than the node's base indentation.
You can provide

`except`to prevent indentation of lines that
match a pattern (for example

`/^else\b/`in

`if`/

`else`constructs), and you can change the amount of units used with the

`units`option.

flatIndent `(`context `:`TreeIndentContext `) →`number An indentation strategy that aligns a node's content to its base
indentation.

indentOnInput `() →`Extension Enables reindentation on input. When a language defines an

`indentOnInput`field in its

language
data , which must hold a regular
expression, the line at the cursor will be reindented whenever new
text is typed and the input from the start of the line up to the
cursor matches that regexp.

To avoid unneccesary reindents, it is recommended to start the
regexp with

`^`(usually followed by

`\s*`), and end it with

`$`.
For example,

`/^\s*\}$/`will reindent when a closing brace is
added at the start of a line.

### Bracket Matching

bracketMatching `(`config `⁠?:`Config = {} `) →`Extension Create an extension that enables bracket matching. Whenever the
cursor is next to a bracket, that bracket and the one it matches
are highlighted. Or, when no matching bracket is found, another
highlighting style is used to indicate this.

interface Config afterCursor `⁠?:`boolean Whether the bracket matching should look at the character after
the cursor when matching (if the one before isn't a bracket).
Defaults to true.

brackets `⁠?:`string The bracket characters to match, as a string of pairs. Defaults
to

`"()[]{}"`. Note that these are only used as fallback when
there is no

matching
information in the syntax tree.

maxScanDistance `⁠?:`number The maximum distance to scan for matching brackets. This is only
relevant for brackets not encoded in the syntax tree. Defaults
to 10 000.

renderMatch `⁠?:`fn `(`match `:`MatchResult `,`state `:`EditorState `) →`readonly Range `<`Decoration `>[]`Can be used to configure the way in which brackets are
decorated. The default behavior is to add the

`cm-matchingBracket`class for matching pairs, and

`cm-nonmatchingBracket`for mismatched pairs or single brackets.

matchBrackets `(`state : EditorState , pos : number , dir : -1 | 1 , config ⁠?: Config = {} `) →`MatchResult `|`null Find the matching bracket for the token at

`pos`, scanning
direction

`dir`. Only the

`brackets`and

`maxScanDistance`properties are used from

`config`, if given. Returns null if no
bracket was found at

`pos`, or a match result otherwise.

interface MatchResult The result returned from

`matchBrackets`.

start `: {`from `:`number `,`to `:`number `}`The extent of the bracket token found.

end `⁠?: {`from `:`number `,`to `:`number `}`The extent of the matched token, if any was found.

matched `:`boolean Whether the tokens match. This can be false even when

`end`has
a value, if that token doesn't match the opening token.

bracketMatchingHandle `:`NodeProp `<`fn `(`node `:`SyntaxNode `) →`SyntaxNode `|`null `>`When larger syntax nodes, such as HTML tags, are marked as
opening/closing, it can be a bit messy to treat the whole node as
a matchable bracket. This node prop allows you to define, for such
a node, a ‘handle’—the part of the node that is highlighted, and
that the cursor must be on to activate highlighting in the first
place.

### Stream Parser

Stream parsers provide a way to adapt language modes written in the
CodeMirror 5 style (see

@codemirror/legacy-modes )
to the

`Language`interface.

class StreamLanguage `<`State `>`extends Language A

language class based on a CodeMirror
5-style

streaming parser .

static define `<`State `>(`spec `:`StreamParser `<`State `>) →`StreamLanguage `<`State `>`Define a stream language.

interface StreamParser `<`State `>`A stream parser parses or tokenizes content from start to end,
emitting tokens as it goes over it. It keeps a mutable (but
copyable) object with state, in which it can store information
about the current context.

name `⁠?:`string A name for this language.

startState `⁠?:`fn `(`indentUnit `:`number `) →`State Produce a start state for the parser.

token `(`stream `:`StringStream `,`state `:`State `) →`string `|`null Read one token, advancing the stream past it, and returning a
string indicating the token's style tag—either the name of one
of the tags in

`tags`or

`tokenTable`, or such a
name suffixed by one or more tag

modifier names, separated by periods. For example

`"keyword"`or
"

`variableName.constant"`, or a space-separated set of such
token types.

It is okay to return a zero-length token, but only if that
updates the state so that the next call will return a non-empty
token again.

blankLine `⁠?:`fn `(`state `:`State `,`indentUnit `:`number `)`This notifies the parser of a blank line in the input. It can
update its state here if it needs to.

copyState `⁠?:`fn `(`state `:`State `) →`State Copy a given state. By default, a shallow object copy is done
which also copies arrays held at the top level of the object.

indent `⁠?:`fn `(`state : State , textAfter : string , context : IndentContext `) →`number `|`null Compute automatic indentation for the line that starts with the
given state and text.

languageData `⁠?:`Object `<`any `>`Default

language data to
attach to this language.

tokenTable `⁠?:`Object `<`Tag `|`readonly Tag `[]>`Extra tokens to use in this parser. When the tokenizer returns a
token name that exists as a property in this object, the
corresponding tags will be assigned to the token.

mergeTokens `⁠?:`boolean By default, adjacent tokens of the same type are merged in the
output tree. Set this to false to disable that.

class StringStream Encapsulates a single line of input. Given to stream syntax code,
which uses it to tokenize the content.

new StringStream `(`string : string , tabSize : number , indentUnit : number , overrideIndent ⁠?: number `)`Create a stream.

pos `:`number The current position on the line.

start `:`number The start position of the current token.

string `:`string The line.

indentUnit `:`number The current indent unit size.

eol `() →`boolean True if we are at the end of the line.

sol `() →`boolean True if we are at the start of the line.

peek `() →`string `|`undefined Get the next code unit after the current position, or undefined
if we're at the end of the line.

next `() →`string `|`undefined Read the next code unit and advance

`this.pos`.

eat `(`match `:`string `|`RegExp `|`fn `(`ch `:`string `) →`boolean `) →`string `|`undefined Match the next character against the given string, regular
expression, or predicate. Consume and return it if it matches.

eatWhile `(`match `:`string `|`RegExp `|`fn `(`ch `:`string `) →`boolean `) →`boolean Continue matching characters that match the given string,
regular expression, or predicate function. Return true if any
characters were consumed.

eatSpace `() →`boolean Consume whitespace ahead of

`this.pos`. Return true if any was
found.

skipToEnd `()`Move to the end of the line.

skipTo `(`ch `:`string `) →`boolean `|`undefined Move to directly before the given character, if found on the
current line.

backUp `(`n `:`number `)`Move back

`n`characters.

column `() →`number Get the column position at

`this.pos`.

indentation `() →`number Get the indentation column of the current line.

match `(`pattern : string | RegExp , consume ⁠?: boolean , caseInsensitive ⁠?: boolean `) →`boolean `|`RegExpMatchArray `|`null Match the input against the given string or regular expression
(which should start with a

`^`). Return true or the regexp match
if it matches.

Unless

`consume`is set to

`false`, this will move

`this.pos`past the matched text.

When matching a string

`caseInsensitive`can be set to true to
make the match case-insensitive.

current `() →`string Get the current token.

@codemirror/ commands This package exports a collection of generic editing commands, along
with key bindings for a lot of them.

### Keymaps

standardKeymap `:`readonly KeyBinding `[]`An array of key bindings closely sticking to platform-standard or
widely used bindings. (This includes the bindings from

`emacsStyleKeymap`, with their

`key`property changed to

`mac`.)

- ArrowLeft:
`cursorCharLeft`- (
`selectCharLeft`- with Shift)
- ArrowRight:
`cursorCharRight`- (
`selectCharRight`- with Shift)
- Ctrl-ArrowLeft (Alt-ArrowLeft on macOS):
`cursorGroupLeft`- (
`selectGroupLeft`- with Shift)
- Ctrl-ArrowRight (Alt-ArrowRight on macOS):
`cursorGroupRight`- (
`selectGroupRight`- with Shift)
- Cmd-ArrowLeft (on macOS):
`cursorLineStart`- (
`selectLineStart`- with Shift)
- Cmd-ArrowRight (on macOS):
`cursorLineEnd`- (
`selectLineEnd`- with Shift)
- ArrowUp:
`cursorLineUp`- (
`selectLineUp`- with Shift)
- ArrowDown:
`cursorLineDown`- (
`selectLineDown`- with Shift)
- Cmd-ArrowUp (on macOS):
`cursorDocStart`- (
`selectDocStart`- with Shift)
- Cmd-ArrowDown (on macOS):
`cursorDocEnd`- (
`selectDocEnd`- with Shift)
- Ctrl-ArrowUp (on macOS):
`cursorPageUp`- (
`selectPageUp`- with Shift)
- Ctrl-ArrowDown (on macOS):
`cursorPageDown`- (
`selectPageDown`- with Shift)
- PageUp:
`cursorPageUp`- (
`selectPageUp`- with Shift)
- PageDown:
`cursorPageDown`- (
`selectPageDown`- with Shift)
- Home:
`cursorLineBoundaryBackward`- (
`selectLineBoundaryBackward`- with Shift)
- End:
`cursorLineBoundaryForward`- (
`selectLineBoundaryForward`- with Shift)
- Ctrl-Home (Cmd-Home on macOS):
`cursorDocStart`- (
`selectDocStart`- with Shift)
- Ctrl-End (Cmd-Home on macOS):
`cursorDocEnd`- (
`selectDocEnd`- with Shift)
- Enter and Shift-Enter:
`insertNewlineAndIndent`- Ctrl-a (Cmd-a on macOS):
`selectAll`- Backspace:
`deleteCharBackward`- Delete:
`deleteCharForward`- Ctrl-Backspace (Alt-Backspace on macOS):
`deleteGroupBackward`- Ctrl-Delete (Alt-Delete on macOS):
`deleteGroupForward`- Cmd-Backspace (macOS):
`deleteLineBoundaryBackward`- .
- Cmd-Delete (macOS):
`deleteLineBoundaryForward`- .
defaultKeymap `:`readonly KeyBinding `[]`The default keymap. Includes all bindings from

`standardKeymap`plus the following:

- Alt-ArrowLeft (Ctrl-ArrowLeft on macOS):
`cursorSyntaxLeft`- (
`selectSyntaxLeft`- with Shift)
- Alt-ArrowRight (Ctrl-ArrowRight on macOS):
`cursorSyntaxRight`- (
`selectSyntaxRight`- with Shift)
- Alt-ArrowUp:
`moveLineUp`- Alt-ArrowDown:
`moveLineDown`- Shift-Alt-ArrowUp:
`copyLineUp`- Shift-Alt-ArrowDown:
`copyLineDown`- Escape:
`simplifySelection`- Ctrl-Enter (Cmd-Enter on macOS):
`insertBlankLine`- Alt-l (Ctrl-l on macOS):
`selectLine`- Ctrl-i (Cmd-i on macOS):
`selectParentSyntax`- Ctrl-[ (Cmd-[ on macOS):
`indentLess`- Ctrl-] (Cmd-] on macOS):
`indentMore`- Ctrl-Alt-\ (Cmd-Alt-\ on macOS):
`indentSelection`- Shift-Ctrl-k (Shift-Cmd-k on macOS):
`deleteLine`- Shift-Ctrl-\ (Shift-Cmd-\ on macOS):
`cursorMatchingBracket`- Ctrl-/ (Cmd-/ on macOS):
`toggleComment`- .
- Shift-Alt-a:
`toggleBlockComment`- .
- Ctrl-m (Alt-Shift-m on macOS):
`toggleTabFocusMode`- .
emacsStyleKeymap `:`readonly KeyBinding `[]`Array of key bindings containing the Emacs-style bindings that are
available on macOS by default.

- Ctrl-b:
`cursorCharLeft`- (
`selectCharLeft`- with Shift)
- Ctrl-f:
`cursorCharRight`- (
`selectCharRight`- with Shift)
- Ctrl-p:
`cursorLineUp`- (
`selectLineUp`- with Shift)
- Ctrl-n:
`cursorLineDown`- (
`selectLineDown`- with Shift)
- Ctrl-a:
`cursorLineStart`- (
`selectLineStart`- with Shift)
- Ctrl-e:
`cursorLineEnd`- (
`selectLineEnd`- with Shift)
- Ctrl-d:
`deleteCharForward`- Ctrl-h:
`deleteCharBackward`- Ctrl-k:
`deleteToLineEnd`- Ctrl-Alt-h:
`deleteGroupBackward`- Ctrl-o:
`splitLine`- Ctrl-t:
`transposeChars`- Ctrl-v:
`cursorPageDown`- Alt-v:
`cursorPageUp`indentWithTab `:`KeyBinding A binding that binds Tab to

`indentMore`and
Shift-Tab to

`indentLess`.
Please see the

Tab example before using
this.

### Selection

simplifySelection `:`StateCommand Simplify the current selection. When multiple ranges are selected,
reduce it to its main range. Otherwise, if the selection is
non-empty, convert it to a cursor selection.

#### By character

cursorCharLeft `:`Command Move the selection one character to the left (which is backward in
left-to-right text, forward in right-to-left text).

selectCharLeft `:`Command Move the selection head one character to the left, while leaving
the anchor in place.

cursorCharRight `:`Command Move the selection one character to the right.

selectCharRight `:`Command Move the selection head one character to the right.

cursorCharForward `:`Command Move the selection one character forward.

selectCharForward `:`Command Move the selection head one character forward.

cursorCharBackward `:`Command Move the selection one character backward.

selectCharBackward `:`Command Move the selection head one character backward.

cursorCharForwardLogical `:`StateCommand Move the selection one character forward, in logical
(non-text-direction-aware) string index order.

selectCharForwardLogical `:`StateCommand Move the selection head one character forward by logical
(non-direction aware) string index order.

cursorCharBackwardLogical `:`StateCommand Move the selection one character backward, in logical string index
order.

selectCharBackwardLogical `:`StateCommand Move the selection head one character backward by logical string
index order.

#### By group

cursorGroupLeft `:`Command Move the selection to the left across one group of word or
non-word (but also non-space) characters.

selectGroupLeft `:`Command Move the selection head one

group to
the left.

cursorGroupRight `:`Command Move the selection one group to the right.

selectGroupRight `:`Command Move the selection head one group to the right.

cursorGroupForward `:`Command Move the selection one group forward.

selectGroupForward `:`Command Move the selection head one group forward.

cursorGroupBackward `:`Command Move the selection one group backward.

selectGroupBackward `:`Command Move the selection head one group backward.

cursorGroupForwardWin `:`Command Move the cursor one group forward in the default Windows style,
where it moves to the start of the next group.

selectGroupForwardWin `:`Command Move the selection head one group forward in the default Windows
style, skipping to the start of the next group.

cursorSubwordForward `:`Command Move the selection one group or camel-case subword forward.

selectSubwordForward `:`Command Move the selection head one group or camel-case subword forward.

cursorSubwordBackward `:`Command Move the selection one group or camel-case subword backward.

selectSubwordBackward `:`Command Move the selection head one group or subword backward.

#### Vertical motion

cursorLineUp `:`Command Move the selection one line up.

selectLineUp `:`Command Move the selection head one line up.

cursorLineDown `:`Command Move the selection one line down.

selectLineDown `:`Command Move the selection head one line down.

cursorPageUp `:`Command Move the selection one page up.

selectPageUp `:`Command Move the selection head one page up.

cursorPageDown `:`Command Move the selection one page down.

selectPageDown `:`Command Move the selection head one page down.

#### By line boundary

cursorLineBoundaryForward `:`Command Move the selection to the next line wrap point, or to the end of
the line if there isn't one left on this line.

selectLineBoundaryForward `:`Command Move the selection head to the next line boundary.

cursorLineBoundaryBackward `:`Command Move the selection to previous line wrap point, or failing that to
the start of the line. If the line is indented, and the cursor
isn't already at the end of the indentation, this will move to the
end of the indentation instead of the start of the line.

selectLineBoundaryBackward `:`Command Move the selection head to the previous line boundary.

cursorLineBoundaryLeft `:`Command Move the selection one line wrap point to the left.

selectLineBoundaryLeft `:`Command Move the selection head one line boundary to the left.

cursorLineBoundaryRight `:`Command Move the selection one line wrap point to the right.

selectLineBoundaryRight `:`Command Move the selection head one line boundary to the right.

cursorLineStart `:`Command Move the selection to the start of the line.

selectLineStart `:`Command Move the selection head to the start of the line.

cursorLineEnd `:`Command Move the selection to the end of the line.

selectLineEnd `:`Command Move the selection head to the end of the line.

selectLine `:`StateCommand Expand the selection to cover entire lines.

#### By document boundary

cursorDocStart `:`StateCommand Move the selection to the start of the document.

selectDocStart `:`StateCommand Move the selection head to the start of the document.

cursorDocEnd `:`StateCommand Move the selection to the end of the document.

selectDocEnd `:`StateCommand Move the selection head to the end of the document.

selectAll `:`StateCommand Select the entire document.

#### By syntax

cursorSyntaxLeft `:`Command Move the cursor over the next syntactic element to the left.

selectSyntaxLeft `:`Command Move the selection head over the next syntactic element to the left.

cursorSyntaxRight `:`Command Move the cursor over the next syntactic element to the right.

selectSyntaxRight `:`Command Move the selection head over the next syntactic element to the right.

selectParentSyntax `:`StateCommand Select the next syntactic construct that is larger than the
selection. Note that this will only work insofar as the language

provider you use builds up a full
syntax tree.

cursorMatchingBracket `:`StateCommand Move the selection to the bracket matching the one it is currently
on, if any.

selectMatchingBracket `:`StateCommand Extend the selection to the bracket matching the one the selection
head is currently on, if any.

### Deletion

deleteCharBackward `:`Command Delete the selection, or, for cursor selections, the character or
indentation unit before the cursor.

deleteCharBackwardStrict `:`Command Delete the selection or the character before the cursor. Does not
implement any extended behavior like deleting whole indentation
units in one go.

deleteCharForward `:`Command Delete the selection or the character after the cursor.

deleteGroupBackward `:`StateCommand Delete the selection or backward until the end of the next

group , only skipping groups of
whitespace when they consist of a single space.

deleteGroupForward `:`StateCommand Delete the selection or forward until the end of the next group.

deleteToLineStart `:`Command Delete the selection, or, if it is a cursor selection, delete to
the start of the line. If the cursor is directly at the start of the
line, delete the line break before it.

deleteToLineEnd `:`Command Delete the selection, or, if it is a cursor selection, delete to
the end of the line. If the cursor is directly at the end of the
line, delete the line break after it.

deleteLineBoundaryBackward `:`Command Delete the selection, or, if it is a cursor selection, delete to
the start of the line or the next line wrap before the cursor.

deleteLineBoundaryForward `:`Command Delete the selection, or, if it is a cursor selection, delete to
the end of the line or the next line wrap after the cursor.

deleteTrailingWhitespace `:`StateCommand Delete all whitespace directly before a line end from the
document.

### Line manipulation

splitLine `:`StateCommand Replace each selection range with a line break, leaving the cursor
on the line before the break.

moveLineUp `:`StateCommand Move the selected lines up one line.

moveLineDown `:`StateCommand Move the selected lines down one line.

copyLineUp `:`StateCommand Create a copy of the selected lines. Keep the selection in the top copy.

copyLineDown `:`StateCommand Create a copy of the selected lines. Keep the selection in the bottom copy.

deleteLine `:`Command Delete selected lines.

### Indentation

indentSelection `:`StateCommand Auto-indent the selected lines. This uses the

indentation service
facet as source for auto-indent
information.

indentMore `:`StateCommand Add a

unit of indentation to all selected
lines.

indentLess `:`StateCommand Remove a

unit of indentation from all
selected lines.

insertTab `:`StateCommand Insert a tab character at the cursor or, if something is selected,
use

`indentMore`to indent the entire
selection.

### Character Manipulation

transposeChars `:`StateCommand Flip the characters before and after the cursor(s).

insertNewline `:`StateCommand Replace the selection with a newline.

insertNewlineAndIndent `:`StateCommand Replace the selection with a newline and indent the newly created
line(s). If the current line consists only of whitespace, this
will also delete that whitespace. When the cursor is between
matching brackets, an additional newline will be inserted after
the cursor.

insertNewlineKeepIndent `:`StateCommand Replace the selection with a newline and the same amount of
indentation as the line above.

insertBlankLine `:`StateCommand Create a blank, indented line below the current line.

### Undo History

history `(`config `⁠?:`Object = {} `) →`Extension Create a history extension with the given configuration.

config minDepth `⁠?:`number The minimum depth (amount of events) to store. Defaults to 100.

newGroupDelay `⁠?:`number The maximum time (in milliseconds) that adjacent events can be
apart and still be grouped together. Defaults to 500.

joinToEvent `⁠?:`fn `(`tr `:`Transaction `,`isAdjacent `:`boolean `) →`boolean By default, when close enough together in time, changes are
joined into an existing undo event if they touch any of the
changed ranges from that event. You can pass a custom predicate
here to influence that logic.

historyKeymap `:`readonly KeyBinding `[]`Default key bindings for the undo history.

- Mod-z:
`undo`- .
- Mod-y (Mod-Shift-z on macOS) + Ctrl-Shift-z on Linux:
`redo`- .
- Mod-u:
`undoSelection`- .
- Alt-u (Mod-Shift-u on macOS):
`redoSelection`- .
historyField `:`StateField `<`unknown `>`The state field used to store the history data. Should probably
only be used when you want to

serialize or

deserialize state objects in a way
that preserves history.

undo `:`StateCommand Undo a single group of history events. Returns false if no group
was available.

redo `:`StateCommand Redo a group of history events. Returns false if no group was
available.

undoSelection `:`StateCommand Undo a change or selection change.

redoSelection `:`StateCommand Redo a change or selection change.

undoDepth `(`state `:`EditorState `) →`number The amount of undoable change events available in a given state.

redoDepth `(`state `:`EditorState `) →`number The amount of redoable change events available in a given state.

isolateHistory `:`AnnotationType `<`"before" `|`"after" `|`"full" `>`Transaction annotation that will prevent that transaction from
being combined with other transactions in the undo history. Given

`"before"`, it'll prevent merging with previous transactions. With

`"after"`, subsequent transactions won't be combined with this
one. With

`"full"`, the transaction is isolated on both sides.

invertedEffects `:`Facet `<`fn `(`tr `:`Transaction `) →`readonly StateEffect `<`any `>[]>`This facet provides a way to register functions that, given a
transaction, provide a set of effects that the history should
store when inverting the transaction. This can be used to
integrate some kinds of effects in the history, so that they can
be undone (and redone again).

### Commenting and Uncommenting

interface CommentTokens An object of this type can be provided as

language
data under a

`"commentTokens"`property to configure comment syntax for a language.

block `⁠?: {`open `:`string `,`close `:`string `}`The block comment syntax, if any. For example, for HTML
you'd provide

`{open: "<!--", close: "-->"}`.

line `⁠?:`string The line comment syntax. For example

`"//"`.

toggleComment `:`StateCommand Comment or uncomment the current selection. Will use line comments
if available, otherwise falling back to block comments.

toggleLineComment `:`StateCommand Comment or uncomment the current selection using line comments.
The line comment syntax is taken from the

`commentTokens`language
data .

lineComment `:`StateCommand Comment the current selection using line comments.

lineUncomment `:`StateCommand Uncomment the current selection using line comments.

toggleBlockComment `:`StateCommand Comment or uncomment the current selection using block comments.
The block comment syntax is taken from the

`commentTokens`language
data .

blockComment `:`StateCommand Comment the current selection using block comments.

blockUncomment `:`StateCommand Uncomment the current selection using block comments.

toggleBlockCommentByLine `:`StateCommand Comment or uncomment the lines around the current selection using
block comments.

### Tab Focus Mode

toggleTabFocusMode `:`Command Enables or disables

tab-focus mode . While on, this
prevents the editor's key bindings from capturing Tab or
Shift-Tab, making it possible for the user to move focus out of
the editor with the keyboard.

temporarilySetTabFocusMode `:`Command Temporarily enables

tab-focus
mode for two seconds or until
another key is pressed.

@codemirror/ search searchKeymap `:`readonly KeyBinding `[]`Default search-related key bindings.

- Mod-f:
`openSearchPanel`- F3, Mod-g:
`findNext`- Shift-F3, Shift-Mod-g:
`findPrevious`- Mod-Alt-g:
`gotoLine`- Mod-d:
`selectNextOccurrence`search `(`config `⁠?:`Object `) →`Extension Add search state to the editor configuration, and optionally
configure the search extension.
(

`openSearchPanel`will automatically
enable this if it isn't already on).

config top `⁠?:`boolean Whether to position the search panel at the top of the editor
(the default is at the bottom).

caseSensitive `⁠?:`boolean Whether to enable case sensitivity by default when the search
panel is activated (defaults to false).

literal `⁠?:`boolean Whether to treat string searches literally by default (defaults to false).

wholeWord `⁠?:`boolean Controls whether the default query has by-word matching enabled.
Defaults to false.

regexp `⁠?:`boolean Used to turn on regular expression search in the default query.
Defaults to false.

createPanel `⁠?:`fn `(`view `:`EditorView `) →`Panel Can be used to override the way the search panel is implemented.
Should create a

Panel that contains a form
which lets the user:

- See the
current - search query.
- Manipulate the
query - and
update - the search state with a new
query.
- Notice external changes to the query by reacting to the
appropriate
state effect - .
- Run some of the search commands.
The field that should be focused when opening the panel must be
tagged with a

`main-field=true`DOM attribute.

scrollToMatch `⁠?:`fn `(`range `:`SelectionRange `,`view `:`EditorView `) →`StateEffect `<`unknown `>`By default, matches are scrolled into view using the default
behavior of

`EditorView.scrollIntoView`.
This option allows you to pass a custom function to produce the
scroll effect.

### Commands

findNext `:`Command Open the search panel if it isn't already open, and move the
selection to the first match after the current main selection.
Will wrap around to the start of the document when it reaches the
end.

findPrevious `:`Command Move the selection to the previous instance of the search query,
before the current main selection. Will wrap past the start
of the document to start searching at the end again.

selectMatches `:`Command Select all instances of the search query.

selectSelectionMatches `:`StateCommand Select all instances of the currently selected text.

selectNextOccurrence `:`StateCommand Select next occurrence of the current selection. Expand selection
to the surrounding word when the selection is empty.

replaceNext `:`Command Replace the current match of the search query.

replaceAll `:`Command Replace all instances of the search query with the given
replacement.

openSearchPanel `:`Command Make sure the search panel is open and focused.

closeSearchPanel `:`Command Close the search panel.

gotoLine `:`Command Command that shows a dialog asking the user for a line number, and
when a valid position is provided, moves the cursor to that line.

Supports line numbers, relative line offsets prefixed with

`+`or

`-`, document percentages suffixed with

`%`, and an optional
column position by adding

`:`and a second number after the line
number.

### Search Query

class SearchQuery A search query. Part of the editor's search state.

new SearchQuery `(`config `:`Object `)`Create a query object.

config search `:`string The search string.

caseSensitive `⁠?:`boolean Controls whether the search should be case-sensitive.

literal `⁠?:`boolean By default, string search will replace

`\n`,

`\r`, and

`\t`in
the query with newline, return, and tab characters. When this
is set to true, that behavior is disabled.

regexp `⁠?:`boolean When true, interpret the search string as a regular expression.

replace `⁠?:`string The replace text.

wholeWord `⁠?:`boolean Enable whole-word matching.

search `:`string The search string (or regular expression).

caseSensitive `:`boolean Indicates whether the search is case-sensitive.

literal `:`boolean By default, string search will replace

`\n`,

`\r`, and

`\t`in
the query with newline, return, and tab characters. When this
is set to true, that behavior is disabled.

regexp `:`boolean When true, the search string is interpreted as a regular
expression.

replace `:`string The replace text, or the empty string if no replace text has
been given.

valid `:`boolean Whether this query is non-empty and, in case of a regular
expression search, syntactically valid.

wholeWord `:`boolean When true, matches that contain words are ignored when there are
further word characters around them.

eq `(`other `:`SearchQuery `) →`boolean Compare this query to another query.

getCursor `(`state : EditorState | Text , from ⁠?: number = 0 , to ⁠?: number `) →`Iterator `<{`from `:`number `,`to `:`number `}>`Get a search cursor for this query, searching through the given
range in the given state.

getSearchQuery `(`state `:`EditorState `) →`SearchQuery Get the current search query from an editor state.

setSearchQuery `:`StateEffectType `<`SearchQuery `>`A state effect that updates the current search query. Note that
this only has an effect if the search state has been initialized
(by including

`search`in your configuration or
by running

`openSearchPanel`at least
once).

searchPanelOpen `(`state `:`EditorState `) →`boolean Query whether the search panel is open in the given editor state.

### Cursor

class SearchCursor implements Iterator `<{`from `:`number `,`to `:`number `}>`A search cursor provides an iterator over text matches in a
document.

new SearchCursor `(`text : Text , query : string , from ⁠?: number = 0 , to ⁠?: number = text.length , normalize ⁠?: fn ( string : string ) → string , test ⁠?: fn ( from : number , to : number , buffer : string , bufferPos : number ) → boolean `)`Create a text cursor. The query is the search string,

`from`to

`to`provides the region to search.

When

`normalize`is given, it will be called, on both the query
string and the content it is matched against, before comparing.
You can, for example, create a case-insensitive search by
passing

`s => s.toLowerCase()`.

Text is always normalized with

`.normalize("NFKD")`(when supported).

value `: {`from `:`number `,`to `:`number `}`The current match (only holds a meaningful value after

`next`has been called and when

`done`is false).

done `:`boolean Whether the end of the iterated region has been reached.

next `() →`SearchCursor Look for the next match. Updates the iterator's

`value`and

`done`properties. Should be called
at least once before using the cursor.

nextOverlapping `() →`SearchCursor The

`next`method will ignore matches that partially overlap a
previous match. This method behaves like

`next`, but includes
such matches.

[symbol iterator] `() →`Iterator `<{`from `:`number `,`to `:`number `}>`class RegExpCursor implements Iterator `<{`from `:`number `,`to `:`number `,`match `:`RegExpExecArray `}>`This class is similar to

`SearchCursor`but searches for a regular expression pattern instead of a plain
string.

new RegExpCursor `(`text : Text , query : string , options ⁠?: { ignoreCase ⁠?: boolean , test ⁠?: fn ( from : number , to : number , match : RegExpExecArray ) → boolean }, from ⁠?: number = 0 , to ⁠?: number = text.length `)`Create a cursor that will search the given range in the given
document.

`query`should be the raw pattern (as you'd pass it to

`new RegExp`).

done `:`boolean Set to

`true`when the cursor has reached the end of the search
range.

value `: {`from `:`number `,`to `:`number `,`match `:`RegExpExecArray `}`Will contain an object with the extent of the match and the
match object when

`next`sucessfully finds a match.

next `() →`RegExpCursor Move to the next match, if there is one.

[symbol iterator] `() →`Iterator `<{`from `:`number `,`to `:`number `,`match `:`RegExpExecArray `}>`### Selection matching

highlightSelectionMatches `(`options `⁠?:`Object `) →`Extension This extension highlights text that matches the selection. It uses
the

`"cm-selectionMatch"`class for the highlighting. When

`highlightWordAroundCursor`is enabled, the word at the cursor
itself will be highlighted with

`"cm-selectionMatch-main"`.

options highlightWordAroundCursor `⁠?:`boolean Determines whether, when nothing is selected, the word around
the cursor is matched instead. Defaults to false.

minSelectionLength `⁠?:`number The minimum length of the selection before it is highlighted.
Defaults to 1 (always highlight non-cursor selections).

maxMatches `⁠?:`number The amount of matches (in the viewport) at which to disable
highlighting. Defaults to 100.

wholeWords `⁠?:`boolean Whether to only highlight whole words.

@codemirror/ autocomplete interface Completion Objects type used to represent individual completions.

label `:`string The label to show in the completion picker. This is what input
is matched against to determine whether a completion matches (and
how well it matches).

displayLabel `⁠?:`string An optional override for the completion's visible label. When
using this, matched characters will only be highlighted if you
provide a

`getMatch`function.

detail `⁠?:`string An optional short piece of information to show (with a different
style) after the label.

info `⁠?:`string `|`fn ( completion : Completion ) → Node | { dom : Node , destroy ⁠?: fn ()} | Promise < CompletionInfo > | null Additional info to show when the completion is selected. Can be
a plain string or a function that'll render the DOM structure to
show when invoked.

apply `⁠?:`string `|`fn ( view : EditorView , completion : Completion , from : number , to : number ) How to apply the completion. The default is to replace it with
its

label . When this holds a
string, the completion range is replaced by that string. When it
is a function, that function is called to perform the
completion. If it fires a transaction, it is responsible for
adding the

`pickedCompletion`annotation to it.

type `⁠?:`string The type of the completion. This is used to pick an icon to show
for the completion. Icons are styled with a CSS class created by
appending the type name to

`"cm-completionIcon-"`. You can
define or restyle icons by defining these selectors. The base
library defines simple icons for

`class`,

`constant`,

`enum`,

`function`,

`interface`,

`keyword`,

`method`,

`namespace`,

`property`,

`text`,

`type`, and

`variable`.

Multiple types can be provided by separating them with spaces.

commitCharacters `⁠?:`readonly string `[]`When this option is selected, and one of these characters is
typed, insert the completion before typing the character.

boost `⁠?:`number When given, should be a number from -99 to 99 that adjusts how
this completion is ranked compared to other completions that
match the input as well as this one. A negative number moves it
down the list, a positive number moves it up.

section `⁠?:`string `|`CompletionSection Can be used to divide the completion list into sections.
Completions in a given section (matched by name) will be grouped
together, with a heading above them. Options without section
will appear above all sections. A string value is equivalent to
a

`{name}`object.

type CompletionInfo `=`Node `| {`dom `:`Node `,`destroy `⁠?:`fn `()} |`null The type returned from

`Completion.info`. May be a DOM
node, null to indicate there is no info, or an object with an
optional

`destroy`method that cleans up the node.

interface CompletionSection Object used to describe a completion

section . It is recommended to
create a shared object used by all the completions in a given
section.

name `:`string The name of the section. If no

`render`method is present, this
will be displayed above the options.

header `⁠?:`fn `(`section `:`CompletionSection `) →`HTMLElement An optional function that renders the section header. Since the
headers are shown inside a list, you should make sure the
resulting element has a

`display: list-item`style.

rank `⁠?:`number By default, sections are ordered alphabetically by name. To
specify an explicit order,

`rank`can be used. Sections with a
lower rank will be shown above sections with a higher rank.

autocompletion `(`config `⁠?:`Object = {} `) →`Extension Returns an extension that enables autocompletion.

config activateOnTyping `⁠?:`boolean When enabled (defaults to true), autocompletion will start
whenever the user types something that can be completed.

activateOnCompletion `⁠?:`fn `(`completion `:`Completion `) →`boolean When given, if a completion that matches the predicate is
picked, reactivate completion again as if it was typed normally.

activateOnTypingDelay `⁠?:`number The amount of time to wait for further typing before querying
completion sources via

`activateOnTyping`.
Defaults to 100, which should be fine unless your completion
source is very slow and/or doesn't use

`validFor`.

selectOnOpen `⁠?:`boolean By default, when completion opens, the first option is selected
and can be confirmed with

`acceptCompletion`. When this
is set to false, the completion widget starts with no completion
selected, and the user has to explicitly move to a completion
before you can confirm one.

override `⁠?:`readonly CompletionSource `[]`Override the completion sources used. By default, they will be
taken from the

`"autocomplete"`language
data (which should hold

completion sources or arrays
of

completions ).

closeOnBlur `⁠?:`boolean Determines whether the completion tooltip is closed when the
editor loses focus. Defaults to true.

maxRenderedOptions `⁠?:`number The maximum number of options to render to the DOM.

defaultKeymap `⁠?:`boolean Set this to false to disable the

default completion
keymap . (This requires you to
add bindings to control completion yourself. The bindings should
probably have a higher precedence than other bindings for the
same keys.)

aboveCursor `⁠?:`boolean By default, completions are shown below the cursor when there is
space. Setting this to true will make the extension put the
completions above the cursor when possible.

tooltipClass `⁠?:`fn `(`state `:`EditorState `) →`string When given, this may return an additional CSS class to add to
the completion dialog element.

optionClass `⁠?:`fn `(`completion `:`Completion `) →`string This can be used to add additional CSS classes to completion
options.

icons `⁠?:`boolean By default, the library will render icons based on the
completion's

type in front of
each option. Set this to false to turn that off.

addToOptions `⁠?: {`render : fn ( completion : Completion , state : EditorState , view : EditorView ) → Node | null , position : number `}[]`This option can be used to inject additional content into
options. The

`render`function will be called for each visible
completion, and should produce a DOM node to show.

`position`determines where in the DOM the result appears, relative to
other added widgets and the standard content. The default icons
have position 20, the label position 50, and the detail position
80.

positionInfo `⁠?:`fn `(`view : EditorView , list : Rect , option : Rect , info : Rect , space : Rect `) → {`style `⁠?:`string `,`class `⁠?:`string `}`By default,

info tooltips are
placed to the side of the selected completion. This option can
be used to override that. It will be given rectangles for the
list of completions, the selected option, the info element, and
the availble

tooltip
space , and should return
style and/or class strings for the info element.

compareCompletions `⁠?:`fn `(`a `:`Completion `,`b `:`Completion `) →`number The comparison function to use when sorting completions with the same
match score. Defaults to using

`localeCompare`.

filterStrict `⁠?:`boolean When set to true (the default is false), turn off fuzzy matching
of completions and only show those that start with the text the
user typed. Only takes effect for results where

`filter`isn't false.

interactionDelay `⁠?:`number By default, commands relating to an open completion only take
effect 75 milliseconds after the completion opened, so that key
presses made before the user is aware of the tooltip don't go to
the tooltip. This option can be used to configure that delay.

updateSyncTime `⁠?:`number When there are multiple asynchronous completion sources, this
controls how long the extension waits for a slow source before
displaying results from faster sources. Defaults to 100
milliseconds.

completionStatus `(`state `:`EditorState `) →`"active" `|`"pending" `|`null Get the current completion status. When completions are available,
this will return

`"active"`. When completions are pending (in the
process of being queried), this returns

`"pending"`. Otherwise, it
returns

`null`.

currentCompletions `(`state `:`EditorState `) →`readonly Completion `[]`Returns the available completions as an array.

selectedCompletion `(`state `:`EditorState `) →`Completion `|`null Return the currently selected completion, if any.

selectedCompletionIndex `(`state `:`EditorState `) →`number `|`null Returns the currently selected position in the active completion
list, or null if no completions are active.

setSelectedCompletion `(`index `:`number `) →`StateEffect `<`unknown `>`Create an effect that can be attached to a transaction to change
the currently selected completion.

pickedCompletion `:`AnnotationType `<`Completion `>`This annotation is added to transactions that are produced by
picking a completion.

### Sources

class CompletionContext An instance of this is passed to completion source functions.

new CompletionContext `(`state : EditorState , pos : number , explicit : boolean , view ⁠?: EditorView `)`Create a new completion context. (Mostly useful for testing
completion sources—in the editor, the extension will create
these for you.)

state `:`EditorState The editor state that the completion happens in.

pos `:`number The position at which the completion is happening.

explicit `:`boolean Indicates whether completion was activated explicitly, or
implicitly by typing. The usual way to respond to this is to
only return completions when either there is part of a
completable entity before the cursor, or

`explicit`is true.

view `⁠?:`EditorView The editor view. May be undefined if the context was created
in a situation where there is no such view available, such as
in synchronous updates via

`CompletionResult.update`or when called by test code.

tokenBefore `(`types `:`readonly string `[]) → {`from `:`number `,`to `:`number `,`text `:`string `,`type `:`NodeType `} |`null Get the extent, content, and (if there is a token) type of the
token before

`this.pos`.

matchBefore `(`expr `:`RegExp `) → {`from `:`number `,`to `:`number `,`text `:`string `} |`null Get the match of the given expression directly before the
cursor.

aborted `:`boolean Yields true when the query has been aborted. Can be useful in
asynchronous queries to avoid doing work that will be ignored.

addEventListener `(`type : "abort" , listener : fn (), options ⁠?: { onDocChange : boolean } `)`Allows you to register abort handlers, which will be called when
the query is

aborted .

By default, running queries will not be aborted for regular
typing or backspacing, on the assumption that they are likely to
return a result with a

`validFor`field that
allows the result to be used after all. Passing

`onDocChange: true`will cause this query to be aborted for any document
change.

interface CompletionResult Interface for objects returned by completion sources.

from `:`number The start of the range that is being completed.

to `⁠?:`number The end of the range that is being completed. Defaults to the
main cursor position.

options `:`readonly Completion `[]`The completions returned. These don't have to be compared with
the input by the source—the autocompletion system will do its
own matching (against the text between

`from`and

`to`) and
sorting.

validFor `⁠?:`RegExp `|`fn ( text : string , from : number , to : number , state : EditorState ) → boolean When given, further typing or deletion that causes the part of
the document between (

mapped )

`from`and

`to`to match this regular expression or predicate function
will not query the completion source again, but continue with
this list of options. This can help a lot with responsiveness,
since it allows the completion list to be updated synchronously.

filter `⁠?:`boolean By default, the library filters and scores completions. Set

`filter`to

`false`to disable this, and cause your completions
to all be included, in the order they were given. When there are
other sources, unfiltered completions appear at the top of the
list of completions.

`validFor`must not be given when

`filter`is

`false`, because it only works when filtering.

getMatch `⁠?:`fn `(`completion `:`Completion `,`matched `⁠?:`readonly number `[]) →`readonly number `[]`When

`filter`is set to

`false`or a completion has a

`displayLabel`, this
may be provided to compute the ranges on the label that match
the input. Should return an array of numbers where each pair of
adjacent numbers provide the start and end of a range. The
second argument, the match found by the library, is only passed
when

`filter`isn't

`false`.

update `⁠?:`fn `(`current : CompletionResult , from : number , to : number , context : CompletionContext `) →`CompletionResult `|`null Synchronously update the completion result after typing or
deletion. If given, this should not do any expensive work, since
it will be called during editor state updates. The function
should make sure (similar to

`validFor`) that the
completion still applies in the new state.

map `⁠?:`fn `(`current `:`CompletionResult `,`changes `:`ChangeDesc `) →`CompletionResult `|`null When results contain position-dependent information in, for
example,

`apply`methods, you can provide this method to update
the result for transactions that happen after the query. It is
not necessary to update

`from`and

`to`—those are tracked
automatically.

commitCharacters `⁠?:`readonly string `[]`Set a default set of

commit
characters for all
options in this result.

type CompletionSource `=`fn `(`context `:`CompletionContext `) →`CompletionResult `|`Promise < CompletionResult | null > | null The function signature for a completion source. Such a function
may return its

result synchronously or as a promise. Returning null indicates no
completions are available.

completeFromList `(`list `:`readonly `(`string `|`Completion `)[]) →`CompletionSource Given a a fixed array of options, return an autocompleter that
completes them.

ifIn `(`nodes `:`readonly string `[],`source `:`CompletionSource `) →`CompletionSource Wrap the given completion source so that it will only fire when the
cursor is in a syntax node with one of the given names.

ifNotIn `(`nodes `:`readonly string `[],`source `:`CompletionSource `) →`CompletionSource Wrap the given completion source so that it will not fire when the
cursor is in a syntax node with one of the given names.

completeAnyWord `:`CompletionSource A completion source that will scan the document for words (using a

character categorizer ), and
return those as completions.

insertCompletionText `(`state : EditorState , text : string , from : number , to : number `) →`TransactionSpec Helper function that returns a transaction spec which inserts a
completion's text in the main selection range, and any other
selection range that has the same text in front of it.

### Commands

startCompletion `:`Command Explicitly start autocompletion.

closeCompletion `:`Command Close the currently active completion.

acceptCompletion `:`Command Accept the current completion.

moveCompletionSelection `(`forward `:`boolean `,`by `⁠?:`"option" `|`"page" = "option" `) →`Command Returns a command that moves the completion selection forward or
backward by the given amount.

completionKeymap `:`readonly KeyBinding `[]`Basic keybindings for autocompletion.

- Ctrl-Space (and Alt-` on macOS):
`startCompletion`- Escape:
`closeCompletion`- ArrowDown:
`moveCompletionSelection``(true)`- ArrowUp:
`moveCompletionSelection``(false)`- PageDown:
`moveCompletionSelection``(true, "page")`- PageDown:
`moveCompletionSelection``(true, "page")`- Enter:
`acceptCompletion`### Snippets

snippet `(`template `:`string `) →`fn `(`editor : { state : EditorState , dispatch : fn ( tr : Transaction )}, completion : Completion | null , from : number , to : number `)`Convert a snippet template to a function that can

apply it. Snippets are written
using syntax like this:

`"for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"`Each

`${}`placeholder (you may also use

`#{}`) indicates a field
that the user can fill in. Its name, if any, will be the default
content for the field.

When the snippet is activated by calling the returned function,
the code is inserted at the given position. Newlines in the
template are indented by the indentation of the start line, plus
one

indent unit per tab character after
the newline.

On activation, (all instances of) the first field are selected.
The user can move between fields with Tab and Shift-Tab as long as
the fields are active. Moving to the last field or moving the
cursor out of the current field deactivates the fields.

The order of fields defaults to textual order, but you can add
numbers to placeholders (

`${1}`or

`${1:defaultText}`) to provide
a custom order.

To include a literal

`{`or

`}`in your template, put a backslash
in front of it. This will be removed and the brace will not be
interpreted as indicating a placeholder.

snippetCompletion `(`template `:`string `,`completion `:`Completion `) →`Completion Create a completion from a snippet. Returns an object with the
properties from

`completion`, plus an

`apply`function that
applies the snippet.

nextSnippetField `:`StateCommand Move to the next snippet field, if available.

hasNextSnippetField `(`state `:`EditorState `) →`boolean Check if there is an active snippet with a next field for

`nextSnippetField`to move to.

prevSnippetField `:`StateCommand Move to the previous snippet field, if available.

hasPrevSnippetField `(`state `:`EditorState `) →`boolean Returns true if there is an active snippet and a previous field
for

`prevSnippetField`to move to.

clearSnippet `:`StateCommand A command that clears the active snippet, if any.

snippetKeymap `:`Facet `<`readonly KeyBinding `[],`readonly KeyBinding `[]>`A facet that can be used to configure the key bindings used by
snippets. The default binds Tab to

`nextSnippetField`, Shift-Tab to

`prevSnippetField`, and Escape
to

`clearSnippet`.

### Automatic Bracket Closing

interface CloseBracketConfig Configures bracket closing behavior for a syntax (via

language data ) using the

`"closeBrackets"`identifier.

brackets `⁠?:`string `[]`The opening brackets to close. Defaults to

`["(", "[", "{", "'", '"']`. Brackets may be single characters or a triple of quotes
(as in

`"'''"`).

before `⁠?:`string Characters in front of which newly opened brackets are
automatically closed. Closing always happens in front of
whitespace. Defaults to

`")]}:;>"`.

stringPrefixes `⁠?:`string `[]`When determining whether a given node may be a string, recognize
these prefixes before the opening quote.

closeBrackets `() →`Extension Extension to enable bracket-closing behavior. When a closeable
bracket is typed, its closing bracket is immediately inserted
after the cursor. When closing a bracket directly in front of a
closing bracket inserted by the extension, the cursor moves over
that bracket.

closeBracketsKeymap `:`readonly KeyBinding `[]`Close-brackets related key bindings. Binds Backspace to

`deleteBracketPair`.

deleteBracketPair `:`StateCommand Command that implements deleting a pair of matching brackets when
the cursor is between them.

insertBracket `(`state `:`EditorState `,`bracket `:`string `) →`Transaction `|`null Implements the extension's behavior on text insertion. If the
given string counts as a bracket in the language around the
selection, and replacing the selection with it requires custom
behavior (inserting a closing version or skipping past a
previously-closed bracket), this function returns a transaction
representing that custom behavior. (You only need this if you want
to programmatically insert brackets—the

`closeBrackets`extension will
take care of running this for user input.)

@codemirror/ lint lintKeymap `:`readonly KeyBinding `[]`A set of default key bindings for the lint functionality.

- Ctrl-Shift-m (Cmd-Shift-m on macOS):
`openLintPanel`- F8:
`nextDiagnostic`interface Diagnostic Describes a problem or hint for a piece of code.

from `:`number The start position of the relevant text.

to `:`number The end position. May be equal to

`from`, though actually
covering text is preferable.

severity `:`"error" `|`"hint" `|`"info" `|`"warning" The severity of the problem. This will influence how it is
displayed.

markClass `⁠?:`string When given, add an extra CSS class to parts of the code that
this diagnostic applies to.

source `⁠?:`string An optional source string indicating where the diagnostic is
coming from. You can put the name of your linter here, if
applicable.

message `:`string The message associated with this diagnostic.

renderMessage `⁠?:`fn `(`view `:`EditorView `) →`Node An optional custom rendering function that displays the message
as a DOM node.

actions `⁠?:`readonly Action `[]`An optional array of actions that can be taken on this
diagnostic.

interface Action An action associated with a diagnostic.

name `:`string The label to show to the user. Should be relatively short.

apply `(`view `:`EditorView `,`from `:`number `,`to `:`number `)`The function to call when the user activates this action. Is
given the diagnostic's

current position, which may have
changed since the creation of the diagnostic, due to editing.

linter `(`source `:`LintSource `|`null `,`config `⁠?:`Object = {} `) →`Extension Given a diagnostic source, this function returns an extension that
enables linting with that source. It will be called whenever the
editor is idle (after its content changed). If

`null`is given as
source, this only configures the lint extension.

config delay `⁠?:`number Time to wait (in milliseconds) after a change before running
the linter. Defaults to 750ms.

needsRefresh `⁠?:`fn `(`update `:`ViewUpdate `) →`boolean Optional predicate that can be used to indicate when diagnostics
need to be recomputed. Linting is always re-done on document
changes.

markerFilter `⁠?:`fn `(`diagnostics : readonly Diagnostic [], state : EditorState `) →`Diagnostic `[]`Optional filter to determine which diagnostics produce markers
in the content.

tooltipFilter `⁠?:`fn `(`diagnostics : readonly Diagnostic [], state : EditorState `) →`Diagnostic `[]`Filter applied to a set of diagnostics shown in a tooltip. No
tooltip will appear if the empty set is returned.

hideOn `⁠?:`fn `(`tr `:`Transaction `,`from `:`number `,`to `:`number `) →`boolean `|`null Can be used to control what kind of transactions cause lint
hover tooltips associated with the given document range to be
hidden. By default any transactions that changes the line
around the range will hide it. Returning null falls back to this
behavior.

autoPanel `⁠?:`boolean When enabled (defaults to off), this will cause the lint panel
to automatically open when diagnostics are found, and close when
all diagnostics are resolved or removed.

type LintSource `=`fn `(`view `:`EditorView `) →`readonly Diagnostic `[] |`Promise < readonly Diagnostic []> The type of a function that produces diagnostics.

diagnosticCount `(`state `:`EditorState `) →`number Returns the number of active lint diagnostics in the given state.

forceLinting `(`view `:`EditorView `)`Forces any linters

configured to run when the
editor is idle to run right away.

openLintPanel `:`Command Command to open and focus the lint panel.

closeLintPanel `:`Command Command to close the lint panel, when open.

nextDiagnostic `:`Command Move the selection to the next diagnostic.

previousDiagnostic `:`Command Move the selection to the previous diagnostic.

setDiagnostics `(`state : EditorState , diagnostics : readonly Diagnostic [] `) →`TransactionSpec Returns a transaction spec which updates the current set of
diagnostics, and enables the lint extension if if wasn't already
active.

setDiagnosticsEffect `:`StateEffectType `<`readonly Diagnostic `[]>`The state effect that updates the set of active diagnostics. Can
be useful when writing an extension that needs to track these.

forEachDiagnostic `(`state : EditorState , f : fn ( d : Diagnostic , from : number , to : number ) `)`Iterate over the marked diagnostics for the given editor state,
calling

`f`for each of them. Note that, if the document changed
since the diagnostics were created, the

`Diagnostic`object will
hold the original outdated position, whereas the

`to`and

`from`arguments hold the diagnostic's current position.

lintGutter `(`config `⁠?:`Object = {} `) →`Extension Returns an extension that installs a gutter showing markers for
each line that has diagnostics, which can be hovered over to see
the diagnostics.

config hoverTime `⁠?:`number The delay before showing a tooltip when hovering over a lint gutter marker.

markerFilter `⁠?:`fn `(`diagnostics : readonly Diagnostic [], state : EditorState `) →`Diagnostic `[]`Optional filter determining which diagnostics show a marker in
the gutter.

tooltipFilter `⁠?:`fn `(`diagnostics : readonly Diagnostic [], state : EditorState `) →`Diagnostic `[]`Optional filter for diagnostics displayed in a tooltip, which
can also be used to prevent a tooltip appearing.

@codemirror/ collab This package provides the scaffolding for basic operational-transform
based collaborative editing. When it is enabled, the editor will
accumulate

local changes , which can be sent
to a central service. When new changes are received from the service,
they can be applied to the state with

`receiveUpdates`.

See the

collaborative editing example for a
more detailed description of the protocol.

collab `(`config `⁠?:`Object = {} `) →`Extension Create an instance of the collaborative editing plugin.

config startVersion `⁠?:`number The starting document version. Defaults to 0.

clientID `⁠?:`string This client's identifying

ID . Will be a
randomly generated string if not provided.

sharedEffects `⁠?:`fn `(`tr `:`Transaction `) →`readonly StateEffect `<`any `>[]`It is possible to share information other than document changes
through this extension. If you provide this option, your
function will be called on each transaction, and the effects it
returns will be sent to the server, much like changes are. Such
effects are automatically remapped when conflicting remote
changes come in.

interface Update An update is a set of changes and effects.

changes `:`ChangeSet The changes made by this update.

effects `⁠?:`readonly StateEffect `<`any `>[]`The effects in this update. There'll only ever be effects here
when you configure your collab extension with a

`sharedEffects`option.

clientID `:`string The

ID of the client who
created this update.

receiveUpdates `(`state `:`EditorState `,`updates `:`readonly Update `[]) →`Transaction Create a transaction that represents a set of new updates received
from the authority. Applying this transaction moves the state
forward to adjust to the authority's view of the document.

sendableUpdates `(`state `:`EditorState `) →`readonly `(`Update `& {`origin `:`Transaction `})[]`Returns the set of locally made updates that still have to be sent
to the authority. The returned objects will also have an

`origin`property that points at the transaction that created them. This
may be useful if you want to send along metadata like timestamps.
(But note that the updates may have been mapped in the meantime,
whereas the transaction is just the original transaction that
created them.)

rebaseUpdates `(`updates : readonly Update [], over : readonly { changes : ChangeDesc , clientID : string }[] `) →`readonly Update `[]`Rebase and deduplicate an array of client-submitted updates that
came in with an out-of-date version number.

`over`should hold the
updates that were accepted since the given version (or at least
their change descs and client IDs). Will return an array of
updates that, firstly, has updates that were already accepted
filtered out, and secondly, has been moved over the other changes
so that they apply to the current document version.

getSyncedVersion `(`state `:`EditorState `) →`number Get the version up to which the collab plugin has synced with the
central authority.

getClientID `(`state `:`EditorState `) →`string Get this editor's collaborative editing client ID.

@codemirror/ language-data languages `:`LanguageDescription `[]`An array of language descriptions for known language packages.

codemirror This package depends on most of the core library packages and exports
extension bundles to help set up a simple editor in a few lines of
code.

basicSetup `:`Extension This is an extension value that just pulls together a number of
extensions that you might want in a basic editor. It is meant as a
convenient helper to quickly set up CodeMirror without installing
and importing a lot of separate packages.

Specifically, it includes...

the default command bindings line numbers special character highlighting the undo history a fold gutter custom selection drawing drop cursor multiple selections reindentation on input the default highlight style - (as fallback)
bracket matching bracket closing autocompletion rectangular selection - and
crosshair cursor active line highlighting active line gutter highlighting selection match highlighting search linting (You'll probably want to add some language package to your setup
too.)

This extension does not allow customization. The idea is that,
once you decide you want to configure your editor more precisely,
you take this package's source (which is just a bunch of imports
and an array literal), copy it into your own code, and adjust it
as desired.

minimalSetup `:`Extension A minimal set of extensions to create a functional editor. Only
includes

the default keymap ,

undo
history ,

special character
highlighting ,

custom selection
drawing , and

default highlight
style .

re- export EditorView 