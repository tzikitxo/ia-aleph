<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >

	<xsl:template match="specs">
		<specs>
			<xsl:for-each select="spec">
					<spec>
						<xsl:value-of select="."/>
					</spec>
			</xsl:for-each>
		</specs>
	</xsl:template>

	<xsl:template match="bsw">
		<bsw>
			<xsl:for-each select="weapon">
					<weapon><xsl:value-of select="."/></weapon>
			</xsl:for-each>
		</bsw>
	</xsl:template>

	<xsl:template match="ccw">
		<ccw>
			<xsl:for-each select="weapon">
					<weapon><xsl:value-of select="."/></weapon>
			</xsl:for-each>
		</ccw>
	</xsl:template>

	<xsl:template match="unit">
		<unit>
			<code>
				<xsl:choose>
					<xsl:when test="code!=''">
						<xsl:value-of select="code"/>
					</xsl:when>
					<xsl:otherwise>
						Default
					</xsl:otherwise>
				</xsl:choose>
			</code>
			<cost>
				<xsl:choose>
					<xsl:when test="cost!=''">
						<xsl:value-of select="cost"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="../cost"/>
					</xsl:otherwise>
				</xsl:choose>
			</cost>
			<swc>
				<xsl:value-of select="swc"/>
			</swc>
			<xsl:apply-templates select="specs"/>
			<xsl:apply-templates select="bsw"/>
			<xsl:apply-templates select="ccw"/>
			<note><xsl:value-of select="note"/></note>
		</unit>
	</xsl:template>
	
	<xsl:template match="units/unit">
		<unit>
			<army><xsl:value-of select="army"/></army>
			<isc><xsl:value-of select="isc"/></isc>
			<name><xsl:value-of select="name"/></name>
			<type><xsl:value-of select="type"/></type>
<!--			
			<cost><xsl:value-of select="cost"/></cost>
			<swc><xsl:value-of select="swc"/></swc>
-->
			<mov><xsl:value-of select="mov"/></mov>
			<cc><xsl:value-of select="cc"/></cc>
			<bs><xsl:value-of select="bs"/></bs>
			<ph><xsl:value-of select="ph"/></ph>
			<wip><xsl:value-of select="wip"/></wip>
			<arm><xsl:value-of select="arm"/></arm>
			<bts><xsl:value-of select="bts"/></bts>
			<w><xsl:value-of select="w"/></w>
			<ava><xsl:value-of select="ava"/></ava>
			<irr><xsl:value-of select="irr"/></irr>
			<imp><xsl:value-of select="imp"/></imp>
			<cube><xsl:value-of select="cube"/></cube>
			
			<xsl:apply-templates select="specs"/>
			<xsl:apply-templates select="bsw"/>
			<xsl:apply-templates select="ccw"/>
			
			<note><xsl:value-of select="note"/></note>

			<unit>
				<code>Default</code>
				<cost><xsl:value-of select="cost"/></cost>
				<swc><xsl:value-of select="swc"/></swc>
			</unit>

			<xsl:apply-templates select="./unit"/>
		</unit>
	</xsl:template>

	<xsl:template match="/">
		<units>
			<xsl:apply-templates select="/units/unit"/>
		</units>
	</xsl:template>

</xsl:stylesheet>