export const RANGE_CHART = `<section class="chart" style="grid-template-columns: repeat(6, minmax(0, 1fr));max-width: 36rem;">
    <h3 id="Range_Chart" style="grid-column: span 6 / span 6;">Range Chart</h3>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>Below 24&quot;</strong></div>
    <div style="grid-column: span 4 / span 4;">
        No modifier.
    </div>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>24-48&quot;</strong></div>
    <div style="grid-column: span 4 / span 4;">
        Penetration is reduced by 1.
    </div>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>48-72&quot;</strong></div>
    <div style="grid-column: span 4 / span 4;">
        Penetration is reduced by 2.
    </div>
    <div style="align-content: center;grid-column: span 2 / span 2;"><strong>72&quot;+</strong></div>
    <div style="grid-column: span 4 / span 4;">
        Penetration is reduced by 3.
    </div>
</section>`;

export const PAIRS_CHART = `<section class="chart" style="max-width: 36rem;grid-template-columns: repeat(6, minmax(0, 1fr));">
    <h3 style="text-align: center;grid-column: span 1 / span 1;">Scatter Roll</h3>
    <h3 style="text-align: center;grid-column: span 2 / span 2;">Artillery Roll</h3>
    <h3 style="grid-column: span 3 / span 3;">Outcome</h3>
    <div style="text-align: center;grid-column: span 1 / span 1;">
        <strong>&uarr;</strong>
    </div>
    <div style="text-align: center;grid-column: span 2 / span 2;">
        <strong>Number</strong>
    </div>
    <div style="grid-column: span 3 / span 3;">
        Move the <strong>Blast Marker</strong> the number of inches rolled on the <strong>Artillery
            Dice</strong> in the direction indicated by the <strong>Scatter Dice</strong>.
    </div>
    <div style="text-align: center;grid-column: span 1 / span 1;">
        <strong>Hit</strong>
    </div>
    <div style="text-align: center;grid-column: span 2 / span 2;">
        <strong>Number</strong>
    </div>
    <div style="grid-column: span 3 / span 3;">
        The <strong>Blast Marker</strong> does not move.
    </div>
    <div style="text-align: center;grid-column: span 1 / span 1;">
        <strong>&uarr;</strong>
    </div>
    <div style="text-align: center;grid-column: span 2 / span 2;">
        <strong>Misfire</strong>
    </div>
    <div style="grid-column: span 3 / span 3;">
        The projectile was a dud; the shot has no effect at all.
    </div>
    <div style="text-align: center;grid-column: span 1 / span 1;">
        <strong>Hit</strong>
    </div>
    <div style="text-align: center;grid-column: span 2 / span 2;">
        <strong>Misfire</strong>
    </div>
    <div style="grid-column: span 3 / span 3;">
        Place the blast marker over the model that shot and calculate hits as normal. The weapon is
        destroyed and cannot be used for the rest of the game.
    </div>
</section>`;

export const PROFILE_CHART = `<section class="chart" style="grid-template-columns: repeat(9, minmax(0, 1fr));">
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>M</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>WS</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>BS</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>S</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>T</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>W</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>I</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>A</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);"><strong>Ld</strong></div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">&ndash;</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">4</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">0</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">3</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">6</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">1</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">4</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">1</div>
    <div style="padding: calc(var(--spacing) * 1); text-align: center; font-size: var(--text-sm);">&ndash;</div>
</section>`;

export const NARROW_TABLE = `<section class="table-container" style="max-width: 36rem;">
    <table>
        <thead>
            <tr>
                <th scope="col" style="text-align:left;">Type of Building<sup>&dagger;</sup></th>
                <th scope="col" style="min-width: 10rem;">Armour Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align:left;">Tent or inflatable structure </td>
                <td>5</td>
            </tr>
            <tr>
                <td style="text-align:left;">Mud or straw hut, wooden or tin shack </td>
                <td>10</td>
            </tr>
            <tr>
                <td style="text-align:left;">Plexiglas or plastic</td>
                <td>15</td>
            </tr>
            <tr>
                <td style="text-align:left;">Timber, stone, concrete or plascrete</td>
                <td>20</td>
            </tr>
            <tr>
                <td style="text-align:left;">Steel, plasteel or rockrete </td>
                <td>25</td>
            </tr>
            <tr>
                <td style="text-align:left;">Armaplas, ceramite, or adamantium</td>
                <td>30</td>
            </tr>
        </tbody>
    </table>
    <p>
        <small>
            <sup>&dagger;</sup> <em>Imperium buildings are generally made of timber, stone, concrete or plascrete.
                Administratum and other official buildings are made of steel, plasteel or rockrete. Only purpose-built
                fortifications are constructed from armaplas, ceramite or adamantium.</em>
        </small>
    </p>
</section>`;

export const WIDE_TABLE = `<section class="table-container">
    <table>
        <thead>
            <tr>
                <td class="empty"></td>
                <td class="empty"></td>
                <th scope="colgroup" colSpan="10">
                    Target&apos;s Toughness
                </th>
            </tr>
            <tr>
                <td class="empty"></td>
                <td class="empty"></td>
                <th scope="col">
                    1
                </th>
                <th scope="col">
                    2
                </th>
                <th scope="col">
                    3
                </th>
                <th scope="col">
                    4
                </th>
                <th scope="col">
                    5
                </th>
                <th scope="col">
                    6
                </th>
                <th scope="col">
                    7
                </th>
                <th scope="col">
                    8
                </th>
                <th scope="col">
                    9
                </th>
                <th scope="col">
                    10
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th rowSpan="11" class="text-vertical">
                    Hit Strength
                </th>
            </tr>
            <tr>
                <th scope="row">
                    1
                </th>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    2
                </th>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    3
                </th>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    4
                </th>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    5
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    6
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
                <td class="empty">-</td>
            </tr>
            <tr>
                <th scope="row">
                    7
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>6</td>
            </tr>
            <tr>
                <th scope="row">
                    8
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
            </tr>
            <tr>
                <th scope="row">
                    9
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
            </tr>
            <tr>
                <th scope="row">
                    10
                </th>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
            </tr>
        </tbody>
    </table>
</section>`;

export const BLOCKQUOTE = `<section class="blockquote-container">
    <blockquote>
        <p>
            Warhammer 40,000 is a challenging and involving game, with
            many fantastic races, and endless possibilities. In a game of
            this size and level of complexity there are bound to be some
            situations where the rules seem unclear, or a particular
            situation lies outside the rules as they are written. This is
            inevitable, as we can&apos;t possibly give rules to cover
            every circumstance. Nor would we want to try, as that would
            restrict what you can and cannot do far too much. Players
            should feel free to invent and improvise, exploring the galaxy
            of Warhammer 40,000 for themselves and taking the game far
            beyond the published rules if they wish.
        </p>
    </blockquote>
    <p class="credit">
    &mdash;Rick Priestley &amp; Andy Chambers,
        <cite>Warhammer 40,000 Rulebook (2nd Edition)</cite>
    </p>
</section>`;

export const HOUSE_RULE = `<section class="house-rule">
    <span class="label">House Rule</span>
    <p>
        It is highly recommended that you disregard this, as it breaks the game. Olden Demon, on YouTube, explains how
        <a href="https://youtu.be/t48UFxFlWeM?si=V-77gjXFmCC-YUvZ&amp;t=308" target="_blank">here</a>.
    </p>
</section>`;

export const ORDERED_LIST = `<section class="ordered-list small-markers">
    <ol>
        <li>
            <p>
                The target is behind solid <a href="/rules/movement#Terrain">Terrain</a>, such as hills, rock formations, walls, and buildings, which completley cover it. <strong>Line of Sight</strong> blocking terrain is usually agreed by both players during <a href="/rules/how-to-play#Place_Terrain">Terrain Setup</a>.
            </p>
        </li>
        <li>
            <p>
                Targets are obscured if there is an area of woodland <strong>Terrain</strong> more than 2&quot; deep
                between them and the shooter.
            </p>
        </li>
        <li>
            <p>
                Any interposing models&mdash;friend or foe&mdash;block <strong>Line of Sight</strong>.
            </p>
            <p>
                <em>
                    A common house rule is to allow the second rank of models within the same unit to draw <strong>Line of
                        Sight</strong> through the first rank, with the exception of <a
                        href="/rules/weapon-rules#Template_Weapons">Template Weapons</a>.
                </em>
            </p>
        </li>
    </ol>
</section>`;

export const TEXT_BLOCK = `<section class="text-block">
  <h4 id="Movement">Movement (M)</h4>
  <p>
  The number of inches a model can move on the tabletop under normal circumstances.
  </p>
</section>`;
