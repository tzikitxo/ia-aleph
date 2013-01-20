<?xml version="1.0"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" >
	
	<xsl:template match="unit">
		<unit>
			<code><xsl:value-of select="@code"/></code>
			<xsl:if test="@cost!=''"><cost><xsl:value-of select="@cost"/></cost></xsl:if>
			<xsl:if test="@swc!=''"><swc><xsl:value-of select="@swc"/></swc></xsl:if>
			<xsl:if test="@specs!=''">
				<specs>
					<xsl:for-each select="tokenize(@specs,',')">
						<spec><xsl:value-of select="."/></spec>
					</xsl:for-each>
				</specs>
			</xsl:if>
			<xsl:if test="@bsw!=''">
				<bsw>
						<xsl:for-each select="tokenize(@bsw,',')">
						<weapon><xsl:value-of select="."/></weapon>
					</xsl:for-each>
				</bsw>
			</xsl:if>
			<xsl:if test="@ccw!=''">
				<ccw>
						<xsl:for-each select="tokenize(@ccw,',')">
							<weapon><xsl:value-of select="."/></weapon>
						</xsl:for-each>
				</ccw>
			</xsl:if>
			<xsl:if test="@note!=''"><note><xsl:value-of select="@note"/></note></xsl:if>
		</unit>
	</xsl:template>
	
	<xsl:template match="units/unit">
		<unit>
			<army><xsl:value-of select="@army"/></army>
			<isc><xsl:value-of select="@isc"/></isc>
			<name><xsl:value-of select="@name"/></name>
			<type><xsl:value-of select="@type"/></type>
			<cost><xsl:value-of select="@cost"/></cost>
			<swc><xsl:value-of select="@swc"/></swc>
			<mov><xsl:value-of select="@mov"/></mov>
			<cc><xsl:value-of select="@cc"/></cc>
			<bs><xsl:value-of select="@bs"/></bs>
			<ph><xsl:value-of select="@ph"/></ph>
			<wip><xsl:value-of select="@wip"/></wip>
			<arm><xsl:value-of select="@arm"/></arm>
			<bts><xsl:value-of select="@bts"/></bts>
			<w><xsl:value-of select="@w"/></w>
			<ava><xsl:value-of select="@ava"/></ava>
			<irr><xsl:value-of select="@irr"/></irr>
			<imp><xsl:value-of select="@imp"/></imp>
			<cube><xsl:value-of select="@cube"/></cube>
			<specs>
				<xsl:if test="@specs!=''">
					<xsl:for-each select="tokenize(@specs,',')">
						<spec><xsl:value-of select="."/></spec>
					</xsl:for-each>
				</xsl:if>
			</specs>
			
			<bsw>
				<xsl:if test="@bsw!=''">
					<xsl:for-each select="tokenize(@bsw,',')">
						<weapon><xsl:value-of select="."/></weapon>
					</xsl:for-each>
				</xsl:if>
			</bsw>
			
			
			<ccw>
				<xsl:if test="@ccw!=''">
					<xsl:for-each select="tokenize(@ccw,',')">
						<weapon><xsl:value-of select="."/></weapon>
					</xsl:for-each>
				</xsl:if>
			</ccw>
			
			<note><xsl:value-of select="@note"/></note>

			<xsl:apply-templates select="./unit"/>
		</unit>
	</xsl:template>

	<xsl:template match="/">
		<units>
			<xsl:apply-templates select="/units/unit"/>
		</units>
	</xsl:template>

</xsl:stylesheet>